import { useState, useEffect } from "react";
import API from "../../services/api";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo3 from "/logo3.png";
import logo2 from "/logo2.png";
import ImageCropper from "../../components/ImageCropper";
import { FaCamera, FaTrash, FaUserGraduate, FaClipboardCheck, FaShieldAlt, FaUserPlus, FaTimes } from "react-icons/fa";
import CommonPopup from "../../components/CommonPopup";

export default function Login() {

  const [showPasswordGuide, setShowPasswordGuide] = useState(false);

  const [step, setStep] = useState(1);

  const [data, setData] = useState({
    username: "",
    otp: "",
    newPassword: ""
  });

  const [popup, setPopup] = useState({
    open: false,
    type: "info",
    message: "",
    onConfirm: null,
    showCancel: false
  });

  const showPopup = (
    type,
    message,
    onConfirm = null,
    showCancel = false
  ) => {
    setPopup({
      open: true,
      type,
      message,
      onConfirm,
      showCancel
    });
  };

  // 🔹 STEP 1: SEND OTP
  const sendOTP = async () => {
    try {
      await API.post("/auth/send-otp", { username: data.username });
      showPopup("success","OTP Sent");
      setStep(2); // 👉 show OTP field
    } catch (err) {
      showPopup("error",err.response?.data?.message || "Error in sending OTP");
    }
  };

  // 🔹 STEP 2: VERIFY + RESET
  const resetPassword = async () => {
    try {
      await API.post("/auth/reset-password", data);
      showPopup("success","Password Updated");
      setStep(1); // reset flow
    } catch (err) {
      showPopup("error",err.response?.data?.message || "Error in resetting password");
    }
  };

  const [showAdminPopup, setShowAdminPopup] = useState(false);
  const [showForgotPopup, setShowForgotPopup] = useState(false);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [admin, setAdmin] = useState({ username: "", password: "" });

  const navigate = useNavigate();

  useEffect(() => {
    const canvas = document.getElementById("network-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    let nodes = [];

    // 🔹 Create nodes
    for (let i = 0; i < 60; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.random() * 1 - 0.5,
        vy: Math.random() * 1 - 0.5
      });
    }

    let mouse = { x: null, y: null };

    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // 🔹 Draw nodes
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        // bounce
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#6366f1";
        ctx.fill();
      });

      // 🔹 Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          let dx = nodes[i].x - nodes[j].x;
          let dy = nodes[i].y - nodes[j].y;
          let dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = "rgba(99,102,241,0.2)";
            ctx.stroke();
          }
        }

        // 🔥 mouse interaction
        if (mouse.x && mouse.y) {
          let dx = nodes[i].x - mouse.x;
          let dy = nodes[i].y - mouse.y;
          let dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = "rgba(24, 151, 71, 0.84)";
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    }

    animate();

    // 🔹 Resize fix
    window.addEventListener("resize", () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    });

  }, []);

  const login = async () => {
    try {
      const res = await API.post("/auth/login", data);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch {
      showPopup("error","Invalid login");
    }
  };

  const verifyAdmin = async () => {
    try {
      const res = await API.post("/auth/verify-admin", admin);

      if (res.status === 200) {
        showPopup("success","Verified");

        setShowAdminPopup(false);
        setShowCreatePopup(true);

      }

    } catch (err) {
      console.log("ERROR:", err.response?.data);

      showPopup("error",err.response?.data?.message || "Invalid Admin");
    }
  };

  const [form, setForm] = useState({
    name:"",
    email:"",
    mobile:"",
    username:"",
    password:"",
    role:"",
    courses:"",
    profile_image:""
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    let { name, value } = e.target;

    // 🔥 Mobile only digits
    if (name === "mobile") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {

    let err = {};

    if (!form.name.trim()) {
      err.name = "Name required";
    }

    if (!form.email.trim()) {
      err.email = "Email required";

    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      err.email = "Invalid email";
    }

    if (!form.mobile) {
      err.mobile = "Mobile required";

    } else if (!/^[0-9]{10}$/.test(form.mobile)) {
      err.mobile = "Must be 10 digits Required";
    }

    if (!form.username.trim()) {
      err.username = "Username required";
    }

    if (!form.password || form.password.length < 6) {
      err.password = "Min 8 characters Required";
    }

    // 🔥 ROLE
    if (!form.role.trim()) {
      err.role =
        "You have to select either Admin or Faculty";
    }

    // 🔥 COURSES
    if (!form.courses.trim()) {
      err.courses =
        "You have to define Courses to teach";
    }

    if (!form.profile_image) {
      err.profile_image = "Profile image required";
    }

    setErrors(err);

    if (Object.keys(err).length > 0) {
      showPopup("warning",Object.values(err)[0]);
    }

    return Object.keys(err).length === 0;
  };

  const createUser = async () => {
    if (!validate()) return;

    try {
      await API.post("/auth/create-user", {
        ...form,
        adminUsername: admin.username,
        adminPassword: admin.password
      });

      showPopup("success","User Created");

      setShowCreatePopup(false);

      // 🔥 reset form
      setForm({
        name: "",
        email: "",
        mobile: "",
        username: "",
        password: "",
        role: "",
        courses: "",
        profile_image: "",
      });

    } catch (err) {
      console.log(err);

      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "User creation failed";

      showPopup("error",msg);
    }
  };

  const closeForgotPopup = () => {

    setShowForgotPopup(false);

    // reset step
    setStep(1);

    // clear fields
    setData({
      username: "",
      otp: "",
      newPassword: "",
      password: ""
    });

  };

const getPasswordStrength = (password) => {

  if (!password) {
    return {
      text: "",
      color: ""
    };
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  // 🟢 STRONG
  if (
    password.length >= 8 &&
    hasUpper &&
    hasLower &&
    hasNumber &&
    hasSpecial
  ) {
    return {
      text: "Strong Password",
      color: "#22c55e"
    };
  }

  // 🟡 NORMAL
  if (
    password.length >= 8 &&
    (
      (hasUpper && hasLower) ||
      hasNumber
    )
  ) {
    return {
      text: "Normal Password",
      color: "#eab308"
    };
  }

  // 🔴 WEAK
  return {
    text: "Weak Password",
    color: "#ef4444"
  };
};

  return (
  <div className="modern-login-page">

    {/* LEFT SIDE */}
    <div className="login-left">

      <div className="left-overlay"></div>

      <div className="left-content">

        <img
          src={logo3}
          alt="Login Banner"
          className="login-page-logo"
        />

        <h1>
          ATTENDANCE
          <span> MANAGEMENT SYSTEM</span>
        </h1>

        <div className="brand-line"></div>

        <p>
          Smart, Simple & Secure way to
          manage attendance efficiently.
        </p>

        <div className="feature-boxes">

          <div className="feature-card">
            <div className="feature-icon">
              <FaUserGraduate />
            </div>

            <span>
              Manage
              <br />
              Students
            </span>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaClipboardCheck />
            </div>

            <span>
              Track
              <br />
              Attendance
            </span>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaShieldAlt />
            </div>

            <span>
              Secure
              <br/>
              System
            </span>
          </div>

        </div>

      </div>

      {/* Bottom Wave */}
      <div className="wave"></div>

    </div>

    {/* RIGHT SIDE */}
    <div className="login-right">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="modern-login-card"
      >

        <div className="top-logo">
          <img src={logo2} alt="logo" />
        </div>

        <h2>
          Welcome <span>Back!</span>
        </h2>

        <p className="login-subtitle">
          Login to continue to your account
        </p>

        {/* USERNAME */}
        <div className="modern-input-group">

          <label>Username</label>

          <input
            type="text"
            placeholder="Enter your username"
            onChange={(e) =>
              setData({ ...data, username: e.target.value })
            }
          />

        </div>

        {/* PASSWORD */}
        <div className="modern-input-group">

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            onChange={(e) =>
              setData({ ...data, password: e.target.value })
            }
          />

        </div>

        {/* OPTIONS */}
        <div className="login-options">

          <p
            className="forgot-link"
            onClick={() => setShowForgotPopup(true)}
          >
            Forgot Password?
          </p>

        </div>

        {/* LOGIN BUTTON */}
        <button
          className="modern-login-btn"
          onClick={login}
        >
          Login
        </button>

        {/* DIVIDER */}
        <div className="divider">
          <span>OR</span>
        </div>

        {/* CREATE BUTTON */}
        <button
          className="modern-create-btn"
          onClick={() => setShowAdminPopup(true)}
        >
          Create New Account
        </button>

        <div className="bottom-tags">
          <span>Secure</span>
          <span>Reliable</span>
          <span>Efficient</span>
        </div>

      </motion.div>

    </div>

      {/* POPUP */}
      {showForgotPopup && (
        <div className="overlay">
          <div className="modal glass">

            <h3 className="modal-title">Let’s Reset Your Password</h3>

            {step === 1 && (
              <>
                <input
                  className="input"
                  placeholder="Enter Username"
                  onChange={(e) =>
                    setData({ ...data, username: e.target.value })
                  }
                />

                <div className="btn-row">
                  <button className="btn btn-primary" onClick={sendOTP}>
                    Send OTP
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={closeForgotPopup}
                  >
                    <FaTimes /> Close
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <input
                  className="input"
                  placeholder="Enter OTP"
                  onChange={(e) =>
                    setData({ ...data, otp: e.target.value })
                  }
                />

                <div className="password-wrapper2">

                  <input
                    className="input"
                    type="password"
                    placeholder="New Password"

                    onChange={(e) =>
                      setData({ ...data, newPassword: e.target.value })
                    }

                    onFocus={() => setShowPasswordGuide(true)}

                    onBlur={() => {
                      setTimeout(() => {
                        setShowPasswordGuide(false);
                      }, 200);
                    }}

                    style={{marginBottom:"5px"}}
                  />

                  {/* 🔥 PASSWORD GUIDE POPUP */}
                  {showPasswordGuide && (
                    <div className="password-guide-popup">

                      <h4>Password Instructions</h4>
                      <div className="password-guide-popup_scroll">
                        <div className="guide-item weak">
                          🔴 <b>Weak Password</b>
                          <p>
                            Less than 8 characters
                          </p>
                        </div>

                        <div className="guide-item normal">
                          🟡 <b>Normal Password</b>
                          <p>
                            Minimum 8 characters with
                            uppercase/lowercase or numbers
                          </p>
                        </div>

                        <div className="guide-item strong">
                          🟢 <b>Strong Password</b>
                          <p>
                            Minimum 8 characters with:
                            <br />
                            Uppercase + Lowercase +
                            Number + Special Character
                          </p>
                        </div>

                        <div className="password-example">
                          Example:
                          <br />
                          <b>Admin@2026</b>
                        </div>

                      </div>
                    </div>
                  )}
                </div>
                <div>
                  {/* 🔥 PASSWORD STATUS */}
                  {data.newPassword && (
                    <div
                      className="password-strength"
                      style={{
                        color: getPasswordStrength(data.newPassword).color, marginLeft:"8px"
                      }}
                    >
                      {getPasswordStrength(data.newPassword).text}
                    </div>
                  )}
                </div>
                

                <h3 className="username-text">
                  Username: {data.username}
                </h3>

                <div className="btn-row">
                  <button className="btn btn-primary" onClick={resetPassword}>
                    Reset
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={closeForgotPopup}
                  >
                    <FaTimes /> Close
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {showAdminPopup && (
        <div className="overlay">
          <div className="modal">

            <h3 className="modal-title">Admin Verification</h3>

            <input
              className="input"
              placeholder="Admin Username"
              onChange={(e) =>
                setAdmin({ ...admin, username: e.target.value })
              }
            />

            <input
              className="input"
              type="password"
              placeholder="Admin Password"
              onChange={(e) =>
                setAdmin({ ...admin, password: e.target.value })
              }
            />

            <div className="btn-row">
              <button className="btn btn-primary" onClick={verifyAdmin}>
                Verify
              </button>

              <button
                className="btn btn-danger"
                onClick={() => setShowAdminPopup(false)}
              >
                <FaTimes /> Close
              </button>
            </div>

          </div>
        </div>
      )}

      {showCreatePopup && (
        <div className="overlay">
          <div className="create-user-modal">

            <div className="modal-header-clean create-header">

              <div className="modal-icon">
                <FaUserPlus />
              </div>

              <div>
                <h2>Create User</h2>

                <b className="modal-subtitle">
                  Add new faculty or admin account
                </b>
              </div>

            </div>

            {/* LEFT IMAGE */}
            <div className="profile-container">

              <div className="profile-left">

                <div className="image-wrapper">

                  <img
                    src={
                      form.profile_image ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt="profile"
                  />

                  <div className="image-overlay">

                    <label htmlFor="uploadInput" className="icon-btn upload-label">
                      <FaCamera size={18} />
                    </label>

                    <button
                      className="icon-btn"
                      onClick={() =>
                        setForm(prev => ({ ...prev, profile_image: "" }))
                      }
                    >
                      <FaTrash size={18} />
                    </button>

                  </div>

                  {/* Hidden input */}
                  <input
                    type="file"
                    id="uploadInput"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      const url = URL.createObjectURL(file);
                      setImageSrc(url);
                      setShowCrop(true);
                    }}
                  />

                </div>

              </div>

              {/* RIGHT FORM */}
              <div className="profile-right">

                <Input name="name" value={form.name} error={errors.name} onChange={handleChange} label="Faculty Name" />
                <Input name="email" value={form.email} error={errors.email} onChange={handleChange} label="Email" />
                <Input name="mobile" value={form.mobile} error={errors.mobile} onChange={handleChange} label="Mobile (+91)" />
                <Input name="username" value={form.username} error={errors.username} onChange={handleChange} label="Username" />
                <div className="input-group password-wrapper">

                  <label>Password</label>

                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className={errors.password ? "error" : ""}

                    onFocus={() => setShowPasswordGuide(true)}

                    onBlur={() => {
                      setTimeout(() => {
                        setShowPasswordGuide(false);
                      }, 200);
                    }}
                  />

                  {/* 🔥 PASSWORD STATUS */}
                  {form.password && (
                    <div
                      className="password-strength"
                      style={{
                        color: getPasswordStrength(form.password).color,
                        marginLeft: "8px",
                        marginTop: "5px"
                      }}
                    >
                      {getPasswordStrength(form.password).text}
                    </div>
                  )}

                  {errors.password && (
                    <p style={{ color:"#ef4444", fontSize:"12px" }}>
                      {errors.password}
                    </p>
                  )}

                  {/* 🔥 PASSWORD GUIDE POPUP */}
                  {showPasswordGuide && (
                    <div className="password-guide-popup">

                      <h4>Password Instructions</h4>
                      <div className="password-guide-popup_scroll">
                        <div className="guide-item weak">
                          🔴 <b>Weak Password</b>
                          <p>
                            Less than 8 characters
                          </p>
                        </div>

                        <div className="guide-item normal">
                          🟡 <b>Normal Password</b>
                          <p>
                            Minimum 8 characters with
                            uppercase/lowercase or numbers
                          </p>
                        </div>

                        <div className="guide-item strong">
                          🟢 <b>Strong Password</b>
                          <p>
                            Minimum 8 characters with:
                            <br />
                            Uppercase + Lowercase +
                            Number + Special Character
                          </p>
                        </div>

                        <div className="password-example">
                          Example:
                          <br />
                          <b>Admin@2026</b>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
                <div className="input-group">

                  <label>Role</label>

                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className={errors.role ? "error" : ""}
                  >
                    <option value="">Select Role</option>
                    <option value="Admin">Admin</option>
                    <option value="Faculty">Faculty</option>
                  </select>

                  {errors.role && (
                    <p style={{ color: "red" }}>
                      {errors.role}
                    </p>
                  )}

                </div>
                <div className="full-width">

                  <Input
                    name="courses"
                    value={form.courses}
                    onChange={handleChange}
                    label="Courses"
                    error={errors.courses}
                  />

                </div>

                <div className="btn-row">
                  <button className="btn btn-primary" onClick={createUser}>
                    Create
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() => setShowCreatePopup(false)}
                  >
                    <FaTimes /> Close
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {showCrop && (
        <div className="overlay">
          <ImageCropper
            image={imageSrc}
            onClose={() => setShowCrop(false)}
            onSave={(croppedImage) => {
              setForm(prev => ({
                ...prev,
                profile_image: croppedImage
              }));

              setShowCrop(false);
            }}
          />
        </div>
      )}

      <CommonPopup
        open={popup.open}
        type={popup.type}
        message={popup.message}
        onConfirm={popup.onConfirm}
        showCancel={popup.showCancel}
        onClose={() =>
          setPopup({
            open: false,
            type: "info",
            message: "",
            onConfirm: null,
            showCancel: false
          })
        }
      />
  </div>
  );
}

function Input({ label, name, value, onChange, error }) {
  return (
    <div className="input-group">
      <label>{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className={error ? "error" : ""}
      />
      {error && <p style={{color:"red"}}>{error}</p>}
    </div>
  );
}