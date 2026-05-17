import { color } from "framer-motion";
import { NavLink } from "react-router-dom";
import { FaChartLine, FaUserGraduate, FaLayerGroup, FaClipboardList } from "react-icons/fa";

export default function Sidebar({ open, toggleSidebar }) {
  return (
    <div className={`sidebar ${open ? "open" : ""}`}>

      <h2 style={{color: "#6366f1"}}>Menu</h2>

      <div style={{ marginTop: "20px" }}>
      <div className="sidebar-menu">
        <NavItem
          to="/dashboard"
          text="Dashboard"
          icon={<FaChartLine />}
          toggle={toggleSidebar}
        />

        <NavItem
          to="/students"
          text="Students Management"
          icon={<FaUserGraduate />}
          toggle={toggleSidebar}
        />

        <NavItem
          to="/batches"
          text="Batch Management"
          icon={<FaLayerGroup />}
          toggle={toggleSidebar}
        />

        <NavItem
          to="/attendance"
          text="Attendance"
          icon={<FaClipboardList />}
          toggle={toggleSidebar}
        />
      </div>
      </div>

    </div>
  );
}

function NavItem({ to, text, icon, toggle }) {
  return (
    <NavLink
      to={to}
      onClick={toggle}
      className={({ isActive }) =>
        isActive ? "menu active" : "menu"
      }
    >
      <span className="menu-icon">
        {icon}
      </span>

      <span className="menu-text">
        {text}
      </span>
    </NavLink>
  );
}