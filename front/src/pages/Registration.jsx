import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Registration() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = form, 2 = otp, 3 = done
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "",
    phone: "", password: "", confirmPassword: "", terms: false,
  });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    setError("");
  };

  // STEP 1 — validate form and send OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!formData.terms) {
      setError("Please accept the Terms & Conditions.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to send OTP.");
        return;
      }
      setOtpSent(true);
      setStep(2);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to resend OTP.");
        return;
      }
      setError("");
      alert("OTP resent to your email.");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 — verify OTP then register
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      // First verify OTP
      const verifyRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        setError(verifyData.message || "Invalid or expired OTP.");
        return;
      }

      // Then register
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });
      const regData = await regRes.json();
      if (!regRes.ok) {
        setError(regData.message || "Registration failed. Please try again.");
        return;
      }

      // Save tokens and redirect
      // localStorage.setItem("token", regData.token);
      // localStorage.setItem("refreshToken", regData.refreshToken);
      // setStep(3);
      // setTimeout(() => navigate("/dashboard"), 2000);

      login(regData.token, regData.refreshToken, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      });
      navigate("/dashboard");

    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="container">

        {/* Left Section */}
        <div className="left-section">
          <img
            className="image-placeholder"
            src="/assets/adv.jpeg"
            alt="COV Advertisement"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Right Section */}
        <div className="right-section">

          {/* ── STEP 1: REGISTRATION FORM ── */}
          {step === 1 && (
            <>
              <div className="form-header">
                <h1>Create Account</h1>
                <p>Join us today and start your learning journey</p>
              </div>

              {error && (
                <p style={{ color: "red", marginBottom: 15, fontSize: 14 }}>{error}</p>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name *</label>
                    <input
                      type="text" id="firstName" name="firstName"
                      value={formData.firstName} onChange={handleChange} required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name *</label>
                    <input
                      type="text" id="lastName" name="lastName"
                      value={formData.lastName} onChange={handleChange} required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email" id="email" name="email"
                    value={formData.email} onChange={handleChange} required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel" id="phone" name="phone"
                    value={formData.phone} onChange={handleChange} required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password" id="password" name="password"
                    value={formData.password} onChange={handleChange} required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    type="password" id="confirmPassword" name="confirmPassword"
                    value={formData.confirmPassword} onChange={handleChange} required
                  />
                </div>

                <div className="checkbox-group">
                  <input
                    type="checkbox" id="terms" name="terms"
                    checked={formData.terms} onChange={handleChange} required
                  />
                  <label htmlFor="terms">
                    I agree to the{" "}
                    <Link to="/terms">Terms &amp; Conditions</Link> and{" "}
                    <Link to="/privacy">Privacy Policy</Link>
                  </label>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Sending OTP..." : "Sign Up"}
                </button>

                <div className="divider"><span>OR</span></div>

                <div className="social-login">
                  <button type="button" className="social-btn">Google</button>
                  <button type="button" className="social-btn">Facebook</button>
                </div>

                <div className="login-link">
                  Already have an account? <Link to="/login">Log In</Link>
                </div>
              </form>
            </>
          )}

          {/* ── STEP 2: OTP VERIFICATION ── */}
          {step === 2 && (
            <>
              <div className="form-header">
                <h1>Verify Email</h1>
                <p>
                  We sent a 6-digit OTP to <strong>{formData.email}</strong>.
                  <br />Check your inbox (and spam folder).
                </p>
              </div>

              {error && (
                <p style={{ color: "red", marginBottom: 15, fontSize: 14 }}>{error}</p>
              )}

              <form onSubmit={handleVerifyAndRegister}>
                <div className="form-group">
                  <label htmlFor="otp">Enter OTP *</label>
                  <input
                    type="text" id="otp" name="otp"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={e => { setOtp(e.target.value); setError(""); }}
                    maxLength={6}
                    required
                    style={{ letterSpacing: 6, fontSize: 20, textAlign: "center" }}
                  />
                </div>

                <p style={{ fontSize: 13, color: "#6b8099", marginBottom: 16 }}>
                  OTP is valid for 10 minutes.{" "}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    style={{ background: "none", border: "none", color: "#00a6a6", cursor: "pointer", fontWeight: 600, fontSize: 13, padding: 0 }}
                  >
                    Resend OTP
                  </button>
                </p>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Verifying..." : "Verify & Create Account"}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep(1); setError(""); setOtp(""); }}
                  style={{ background: "none", border: "none", color: "#6b8099", cursor: "pointer", fontSize: 13, marginTop: 12, display: "block", width: "100%", textAlign: "center" }}
                >
                  ← Back to form
                </button>
              </form>
            </>
          )}

          {/* ── STEP 3: SUCCESS ── */}
          {step === 3 && (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 60, marginBottom: 20 }}>✅</div>
              <h1 style={{ color: "#002b5b", marginBottom: 10 }}>Account Created!</h1>
              <p style={{ color: "#6b8099", marginBottom: 20 }}>
                Welcome to COV. Redirecting to your dashboard...
              </p>
              <div style={{ width: 40, height: 4, background: "#00a6a6", borderRadius: 2, margin: "0 auto", animation: "grow 2s linear forwards" }} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Registration;