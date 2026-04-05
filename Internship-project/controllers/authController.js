import redisClient from "../config/redis.js";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    },
}); 

//send-otp
export const sendOtp=async(req,res)=>{
    try{
        const {email}=req.body;
        if(!email){
            return res.status(400).json({
                success:false,
                message:"Email is required"
            });
        };

        const otp=Math.floor(100000+Math.random()*900000).toString();
        await redisClient.setEx(`otp:${email}`, 600, otp);

        await transporter.sendMail({
            from:process.env.EMAIL_USER,
            to:email,
            subject:"COV-Email Verification OTP",
            html:`<h2>Your OTP:<strong>${otp}</strong></h2><p>This OTP is valid for 10 minutes.</p>`,
        });

        res.json({
            success:true,
            message:"OTP sent to email"
        });
    } catch(err){
        return res.status(500).json({ success: false, message: err.message });
    };
};

//verify-otp
export const verifyOtp=async(req,res)=>{
    try{
        const {email,otp}=req.body;
        const stored=await redisClient.get(`otp:${email}`);

        if(!stored ||stored!==otp){
            return res.status(400).json({
                success:false,
                message:"Invalid or expired OTP"
            });
        };

        await redisClient.del(`otp:${email}`);
        await redisClient.setEx(`verified:${email}`,3600,"true");

        res.json({
            success:true,
            message:"Email verified successfully"
        });
    } catch(err){
        return res.status(500).json({ success: false, message: err.message });
    };
};

//register
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    const isVerified = await redisClient.get(`verified:${email}`);
    if (!isVerified) {
      return res.status(400).json({ success: false, message: "Please verify your email" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const user = new User({ firstName, lastName, email, phone, password, emailVerified: true });
    await user.save();

    await redisClient.del(`verified:${email}`);

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    await redisClient.setEx(`refresh:${user._id}`, 7 * 24 * 3600, refreshToken);

    return res.status(201).json({
      success: true,
      message: "Registered successfully",
      token,
      refreshToken
    });

  } catch (err) {
    console.error("Register error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

//login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ 
        success: false, 
        message: "Invalid email or password" 
    });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ 
        success: false, 
        message: "Invalid email or password" 
    });

    const token = jwt.sign(
        { id: user._id, role: user.role }, 
        process.env.JWT_SECRET, 
        { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
        { id: user._id }, 
        process.env.JWT_REFRESH_SECRET, 
        { expiresIn: "7d" }
    );

    // Store refresh token in Redis (replaces in-memory array)
    await redisClient.setEx(`refresh:${user._id}`, 7 * 24 * 3600, refreshToken);

    res.json({ 
        success: true, 
        message: "Login successful", 
        token, 
        refreshToken 
    });
  } catch (err) { 
    return res.status(500).json({ success: false, message: err.message });
 }
};

//refresh-token
export const refreshTokenController = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(403).json({ 
        success: false, 
        message: "No refresh token" 
    });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const stored = await redisClient.get(`refresh:${decoded.id}`);

    if (!stored || stored !== token) {
      return res.status(403).json({ 
        success: false, 
        message: "Invalid refresh token" 
    });
    }

    const newAccessToken = jwt.sign(
        { id: decoded.id }, 
        process.env.JWT_SECRET, 
        { expiresIn: "1h" }
    );
    res.json({ 
        success: true, 
        accessToken: newAccessToken 
    });

  } catch (err) { 
    return res.status(500).json({ success: false, message: err.message });
 }
};

//logout
export const logout = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    await redisClient.del(`refresh:${decoded.id}`);
    res.json({ 
        success: true, 
        message: "Logged out successfully" 
    });
  } catch (err) { 
    return res.status(500).json({ success: false, message: err.message }); 
}
};
