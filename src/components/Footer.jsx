import "./Footer.css";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* LEFT */}
        <div className="footer-section">
          <h2>Attendance Management System (AMS)</h2>

          <p>Smart, secure and efficient attendance management</p>
          <p>Solution for institutes and organizations.</p>
          
        </div>

        {/* CENTER */}
        <div className="footer-section" style={{marginLeft:"20px"}}>
          <h3>Quick Links</h3>

          <ul className="footer-links">

            <li>
                <Link
                to="/dashboard"
                style={{
                    textDecoration: "none",
                    color: "#d1d5db"
                }}
                >
                Dashboard
                </Link>
            </li>

            <li>
                <Link
                to="/students"
                style={{
                    textDecoration: "none",
                    color: "#d1d5db"
                }}
                >
                Students
                </Link>
            </li>

            <li>
                <Link
                to="/batches"
                style={{
                    textDecoration: "none",
                    color: "#d1d5db"
                }}
                >
                Batches
                </Link>
            </li>

            <li>
                <Link
                to="/attendance"
                style={{
                    textDecoration: "none",
                    color: "#d1d5db"
                }}
                >
                Attendance
                </Link>
            </li>

            </ul>
        </div>

        {/* RIGHT */}
        <div className="footer-section">
          <h3>Contact</h3>

          <p>SITH Computer Institute</p>
          <p>J.M. Road Bhandup - (West), Mumbai, India</p>
          <p>info@sithcomputers.com | www.sithcomputers.com</p>
          <p>+91 97696 94399 | +91 97691 13463</p>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        © 2026 Attendance Management System (AMS). 
        All Rights Reserved.
        <br />
        Designed & Developed by SITH Infotech Pvt.Ltd.
      </div>

    </footer>
  );
}