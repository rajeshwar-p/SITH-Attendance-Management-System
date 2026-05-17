import "./Profile.css";
import { useEffect, useState } from "react";
import API from "../../services/api";
import Layout from "../../components/Layout";
import ImageCropper from "../../components/ImageCropper";
import { FaCamera, FaTrash, FaTimes, FaUserCircle, FaImage, FaIdCard } from "react-icons/fa";
import { motion, useAnimation } from "framer-motion";
import CommonPopup from "../../components/CommonPopup";

export default function Profile() {
  const [user, setUser] = useState({});
  const [edit, setEdit] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
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

  useEffect(() => {
    API.get("/user/profile")
      .then(res => setUser(res.data))
      .catch(() => showPopup("error","Error"));
  }, []);

  const iconControls = useAnimation();
  const textControls = useAnimation();
  const dividerControls = useAnimation();
    
      useEffect(() => {
        const sequence = async () => {
    
          // 🔥 Step 1: icon center appear
          await iconControls.start({
            x: 0,
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5 }
          });
    
          // 🔥 Step 2: icon shift left
          await iconControls.start({
            x: -120,
            transition: { duration: 0.5 }
          });
    
          // 🔥 Step 3: divider + text show
          dividerControls.start({
            scaleY: 1,
            opacity: 1,
            transition: { duration: 0.3 }
          });
    
          textControls.start({
            x: 0,
            opacity: 1,
            transition: { duration: 0.5 }
          });
        };
    
        sequence();
      }, []);

  // 🔹 Remove Image
  const removeImage = async () => {

    try {

      const updatedData = {
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        courses: user.courses,
        role: user.role,
        profile_image: ""
      };

      const res = await API.put(
        "/user/profile",
        updatedData
      );

      setUser(res.data);

      localStorage.setItem(
        "user",
        JSON.stringify(res.data)
      );

      showPopup("success","Profile photo removed");

    } catch (err) {

      showPopup("error",
        err.response?.data?.message ||
        "Error in removing photo"
      );

    }

  };

  // 🔹 Save Update
  const update = async () => {

    try {

      const updatedData = {
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        courses: user.courses,
        role: user.role,
        profile_image: user.profile_image
      };

      const res = await API.put(
        "/user/profile",
        updatedData
      );

      setUser(res.data);

      localStorage.setItem(
        "user",
        JSON.stringify(res.data)
      );

      showPopup("success","Profile Updated Successfully");

      setEdit(false);

    } catch (err) {

      showPopup("error",
        err.response?.data?.message ||
        "Error in updating profile"
      );

    }

  };

  return (
    <Layout>
    <div className="students-page">
        {/* 🔥 HEADER FULL WIDTH */}
        <div className="attendance-header-new">
          <motion.div 
            className="header-icon-box center-icon"
            initial={{ x: 0, opacity: 0, scale: 0.6 }}
            animate={iconControls}
          >
            <FaUserCircle />
          </motion.div>
                      
          <motion.div
            className="header-divider"
            initial={{ scaleY: 0, opacity: 0 }}
            animate={dividerControls}
          />
                      
          <motion.div
            className="header-text"
            initial={{ x: 50, opacity: 0 }}
            animate={textControls}
          >
            <h2 className="header-title">My Profile</h2>
            <b className="header-subtitle">
              Manage your personal information, profile photo and details
            </b>
          </motion.div>
        </div>

        <div className="profile-page-wrapper">
        <div className="profile-page-card profile-photo-card">

          {/* LEFT IMAGE SECTION */}
          <div className="profile-page-left">

            <div className="profile-section-title photo-title">
              <FaImage />
              <span>Faculty Profile Photo</span>
            </div>

            <div className="profile-page-image-wrapper">

            <div className="profile-page-image-box">

              <img
                src={
                  user.profile_image ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="profile"
                className="profile-page-image"
              />

              {/* OVERLAY */}
              <div className="profile-page-overlay">

                <label htmlFor="uploadInput" className="profile-page-icon-btn">
                  <FaCamera size={18} />
                </label>

                <button
                  className="profile-page-icon-btn"
                  onClick={removeImage}
                >
                  <FaTrash size={18} />
                </button>

              </div>

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
          </div>
        </div>

        <div className="profile-page-card profile-details-card">

          <div className="profile-section-title details-title">
            <FaIdCard />
            <span>Profile Details</span>
          </div>

          {/* RIGHT DETAILS SECTION */}
          <div className="profile-page-right">

            <Input
              label="Faculty Name"
              value={user.name}
              edit={edit}
              onChange={(v)=>setUser({...user,name:v})}
            />

            <Input
              label="Email"
              value={user.email}
              edit={edit}
              onChange={(v)=>setUser({...user,email:v})}
            />

            <Input
              label="Mobile"
              value={user.mobile}
              edit={edit}
              onChange={(v)=>setUser({...user,mobile:v})}
            />

            <Input
              label="Username"
              value={user.username}
              edit={false}
            />

            <Input
              label="Password"
              value={user.password}
              edit={false}
            />

            <div className="profile-page-input-group">
              <label>Role</label>

              <select
                value={user.role || ""}
                disabled={true}
                onChange={(e)=>setUser({...user, role:e.target.value})}
              >
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Faculty">Faculty</option>
              </select>
            </div>

            <div className="full-width">
            <Input
              label="Courses"
              value={
                Array.isArray(user.courses)
                  ? user.courses.join(", ")
                  : user.courses
              }
              edit={edit}
              onChange={(v)=>
                setUser({
                  ...user,
                  courses: v
                })
              }
            />
            </div>

            {/* BUTTON */}
            <div className="profile-page-button-row">

              {!edit ? (
                <button
                  className="profile-page-btn"
                  onClick={()=>setEdit(true)}
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  className="profile-page-btn"
                  onClick={update}
                >
                  Save Changes
                </button>
              )}

            </div>

          </div>

        </div>

        {showCrop && (
          <ImageCropper
            image={imageSrc}
            onClose={() => setShowCrop(false)}
            onSave={async (croppedImage) => {
              const updatedUser = { ...user, profile_image: croppedImage };

              setUser(updatedUser);
              setShowCrop(false);

              try {
                const payload = {
                  name: updatedUser.name,
                  email: updatedUser.email,
                  mobile: updatedUser.mobile,
                  courses: updatedUser.courses,
                  role: updatedUser.role,
                  profile_image: updatedUser.profile_image
                };

                const res = await API.put(
                  "/user/profile",
                  payload
                );

                setUser(res.data);

                localStorage.setItem(
                  "user",
                  JSON.stringify(res.data)
                );

                showPopup("success","Profile photo updated");
              } catch {
                showPopup("error","Error in saving image");
              }
            }}
          />
        )}
        </div>
    </div>

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
    </Layout>
   
  );
}

// 🔹 Reusable Input
function Input({ label, value, edit, onChange, type = "text", disabled }) {
  return (
    <div className="profile-page-input-group">

      <label>{label}</label>

      <input
        type={type}
        value={value || ""}
        disabled={disabled !== undefined ? disabled : !edit}
        onChange={(e) => onChange && onChange(e.target.value)}
      />

    </div>
  );
}