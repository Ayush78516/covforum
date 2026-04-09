import User from "../models/User.js";

// GET /api/user/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Ensure tempMembershipId exists (for legacy users)
    if (!user.tempMembershipId) {
      await user.save(); // This triggers the pre('save') hook to generate the ID
    }

    return res.json({ success: true, data: user });
  } catch (err) {
    console.error("getProfile error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/user/personal
export const savePersonal = async (req, res) => {
  try {
    const { firstName, lastName, email, personal } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, email, personal },
      { new: true }
    ).select("-password");
    return res.json({ success: true, message: "Personal details saved", data: user });
  } catch (err) {
    console.error("savePersonal error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/user/address
export const saveAddress = async (req, res) => {
  try {
    const { permAddress, corrAddress } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { permAddress, corrAddress },
      { new: true }
    ).select("-password");
    return res.json({ success: true, message: "Address saved", data: user });
  } catch (err) {
    console.error("saveAddress error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/user/member-details
export const saveMemberDetails = async (req, res) => {
  try {
    const { memberDetails } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { memberDetails },
      { new: true }
    ).select("-password");
    return res.json({ success: true, message: "Member details saved", data: user });
  } catch (err) {
    console.error("saveMemberDetails error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/user/education
export const saveEducation = async (req, res) => {
  try {
    const { education, professionalQualification } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { education, professionalQualification },
      { new: true }
    ).select("-password");
    return res.json({ success: true, message: "Education details saved", data: user });
  } catch (err) {
    console.error("saveEducation error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/user/experience
export const saveExperience = async (req, res) => {
  try {
    const { experience } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { experience },
      { new: true }
    ).select("-password");
    return res.json({ success: true, message: "Experience details saved", data: user });
  } catch (err) {
    console.error("saveExperience error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};