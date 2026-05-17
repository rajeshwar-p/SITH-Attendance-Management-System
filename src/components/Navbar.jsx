import { FaBars, FaUserCircle, } from "react-icons/fa";
import { MdManageAccounts } from "react-icons/md";
import { IoLogOutOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

export default function Navbar({ toggleSidebar }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const ref = useRef();

  // 👉 Outside click close
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="navbar">

      {/* LEFT */}
      <div style={{ display: "flex", alignItems: "center", gap: "30px", margin:"10px" }}>
        <FaBars size={26} onClick={toggleSidebar} style={{ cursor: "pointer" }} />

        <img
          className="sith"
          src="/logo.png"
          alt="logo"
          style={{ height:"auto", width:"150px", cursor: "pointer", margin:"10px" }}
          onClick={() => navigate("/dashboard")}
        />
      </div>

      {/* CENTER */}
      <div className="navbar-heading" style={{ flex: 1, textAlign: "center", fontWeight: "600", fontSize: "20px", color:"#395986" }}>
        Attendance Management System (AMS)
      </div>

      {/* RIGHT (ADMIN BOX) */}
      <div ref={ref} style={{ position: "relative" }}>
        <div
          className="admin-box"
          onClick={() => setOpen(!open)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer"
          }}
        >
          {/* Profile Image */}
          <img
            src={user?.profile_image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
            alt="profile"
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              objectFit: "cover"
            }}
          />

          <span>{user?.name || "Admin"}</span>
        </div>

        {/* 🔽 DROPDOWN */}
        {open && (
          <div className="dropdown-menu">
              <div className="heading-icon4" onClick={() => navigate("/profile")}>
                <MdManageAccounts className="heading-icon4"/> <b>My Profile</b>
              </div>

              <div className="heading-icon4" onClick={logout}>
                <IoLogOutOutline className="heading-icon4"/> <b>Logout</b>
              </div>
            </div>
        )}
      </div>

    </div>
  );
}