import Layout from "../../components/Layout";
import { useEffect, useState } from "react";
import API from "../../services/api";
import { FaEye, FaTrash, FaEdit, FaFilePdf, FaCheck, FaTimes, FaUserGraduate, FaUserPlus, FaUsers, FaIdCard, FaHistory } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import CommonPopup from "../../components/CommonPopup";

export default function Students() {

  const [students, setStudents] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [search, setSearch] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [profileSearch, setProfileSearch] = useState("");
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

  const startEdit = (student) => {
    setEditId(student.id);

    setEditData({
      ...student,
      birth_date: student.birth_date || ""   // 🔥 DIRECT USE
    });
  };
   
  const handleEditChange = (e) => {
    let { name, value } = e.target;

    if (name === "name") {
      value = value.replace(/\b\w/g, c => c.toUpperCase());
    }

    if (name === "mobile") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const validateEdit = () => {
  let err = {};

  if (!editData.name?.trim()) err.name = "Name required";

  if (!editData.email?.trim()) {
    err.email = "Email required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email)) {
    err.email = "Invalid email";
  }

  if (!editData.mobile || !/^[0-9]{10}$/.test(editData.mobile)) {
    err.mobile = "Mobile must be 10 digits";
  }

  if (!editData.birth_date) {
    err.birth_date = "DOB required";
  }

  if (Object.keys(err).length > 0) {
    showPopup("warning",Object.values(err)[0]);
    return false;
  }

  return true;
};

const saveEdit = async () => {
  if (!validateEdit()) return;

  try {
    await API.put(`/students/${editId}`, {
      ...editData,
      birth_date: editData.birth_date   // ✅ STRING ONLY
    });

    showPopup("success","Updated");

    setEditId(null);
    loadStudents();

  } catch {
    showPopup("error","Update failed");
  }
};

const cancelEdit = () => {
  setEditId(null);
};

const deleteStudentHandler = (id) => {

  showPopup(
    "warning",
    "Delete this student?",
    
    async () => {
      try {

        await API.delete(`/students/${id}`);

        setStudents(prev =>
          prev.filter(s => s.id !== id)
        );

        showPopup(
          "success",
          "Student deleted successfully"
        );

      } catch {

        showPopup(
          "error",
          "Delete failed"
        );
      }
    },

    true
  );
};

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    birth_date: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const res = await API.get("/students");
      setStudents(res.data);
    } catch {
      showPopup("error","Error in loading students");
    }
  };

  // 🔥 NAME CAPITALIZE
const handleChange = (e) => {
  let { name, value } = e.target;

  // 🔥 Name Capitalize
  if (name === "name") {
    value = value.replace(/\b\w/g, c => c.toUpperCase());
  }

  // 🔥 Mobile: Only numbers allow
  if (name === "mobile") {
    value = value.replace(/\D/g, ""); // remove non-digit
  }

  setForm(prev => ({ ...prev, [name]: value }));
};

  // 🔥 VALIDATION
const validate = () => {
  let err = {};

  // Name
  if (!form.name.trim()) {
    err.name = "Name required";
  }

  // Email
  if (!form.email.trim()) {
    err.email = "Email required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    err.email = "Invalid email format";
  }

  // Mobile
  if (!form.mobile.trim()) {
    err.mobile = "Mobile required";
  } else if (!/^[0-9]{10}$/.test(form.mobile)) {
    err.mobile = "Mobile must be 10 digits";
  }

  // DOB
  if (!form.birth_date) {
    err.birth_date = "DOB required";
  }

  // Duplicate Email
  const exists = students.find(
    s => s.email.toLowerCase() === form.email.toLowerCase()
  );

  if (exists) {
    err.email = "Email already exists";
    showPopup("warning","Email already exists");
  }

  setErrors(err);
  return Object.keys(err).length === 0;
};

  // 🔥 CREATE
  const createStudent = async () => {
    if (!validate()) {
      showPopup("warning","Invalid input. Please ensure all fields are completed or Check correct formats email and mobile.");
      return;
    }

    try {
      await API.post("/students", form);

      showPopup("success", "Student Created Successfully");

      setForm({
        name: "",
        email: "",
        mobile: "",
        birth_date: ""
      });

      loadStudents();

    } catch (err) {
      showPopup("error", "Error in Create Student");
    }
  };

  // 🔥 PDF EXPORT
  const exportPDF = () => {
  const printWindow = window.open("", "_blank");

  const html = `
  <html>
  <head>
    <title>Students Report</title>

    <style>
      body {
        font-family: Arial;
        padding: 20px;
      }

      .header {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
      }

      .header img {
        width: 160px;
        height: 60px;
        margin-right: 15px;
      }

      .title {
        font-size: 30px;
        font-weight: bold;
        text-align: center;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;   /* 🔥 MUST */
      }

      th, td {
        padding: 10px;
        border: 1px solid #a1a1a1;

        /* 🔥 TEXT WRAP FIX */
        word-break: break-word;
        white-space: normal;
      }

      /* 🔥 EQUAL WIDTH */
      th, td {
        width: 25%;
      }

      th {
        background: #f1f5f9;
        padding: 10px;
        text-align: left;
        border-bottom: 2px solid #ccc;
      }

      td {
        padding: 10px;
        border-bottom: 1px solid #ddd;
      }

      tr:hover {
        background: #f9fafb;
      }
    </style>

  </head>

  <body>

    <div class="header">
      <img src="logo.png" />
      <div class="title">Students Database</div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Mobile</th>
          <th>Date of Birth</th>
        </tr>
      </thead>

      <tbody>
        ${students.map(s => `
          <tr>
            <td>${s.name}</td>
            <td>${s.email}</td>
            <td>+91 ${s.mobile}</td>
            <td>${formatDate(s.birth_date)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

  </body>
  </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();

  // 🔥 IMPORTANT: wait for render
  printWindow.onload = () => {
    printWindow.print();
  };
};

  const formatDate = (date) => {
    if (!date) return "";

    const [year, month, day] = date.split("-");

    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    return `${day}-${months[parseInt(month) - 1]}-${year}`;
  };

  const toInputDate = (date) => {
    if (!date) return "";

    // agar already YYYY-MM-DD hai → same return
    if (date.includes("-") && date.length === 10) return date;

    const d = new Date(date);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formatDateTime = (date) => {
    if (!date) return "";

    const d = new Date(date);

    // 🔥 IST conversion
    const options = {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric"
    };

    return new Intl.DateTimeFormat("en-GB", options).format(d);
  };

const filteredStudents = students.filter((s) => {
    const value = search.toLowerCase().trim();

    return (
      s.name?.toLowerCase().includes(value) ||
      s.email?.toLowerCase().includes(value) ||
      s.mobile?.includes(value) ||
      (s.birth_date && formatDate(s.birth_date).toLowerCase().includes(value))
    );
  })
  .sort((a, b) =>
    a.name.localeCompare(b.name)
  );

const handleFocus = (e) => {
  const { name } = e.target;

  // error remove when user focuses
  setErrors(prev => ({ ...prev, [name]: "" }));
};

const navigate = useNavigate();

const openProfile = async (id) => {
  try {
    const res = await API.get(`/students/full/${id}`);
    setProfileData(res.data);
  } catch {
    showPopup("error","Error in loading profile");
  }
};

const getAttendanceStyle = (percentage) => {
  if (percentage < 40) {
    return {
      bar: "linear-gradient(135deg, #ef4444, #dc2626)", // red
      bg: "#fee2e2"
    };
  } else if (percentage < 75) {
    return {
      bar: "linear-gradient(135deg, #facc15, #eab308)", // yellow
      bg: "#fef9c3"
    };
  } else {
    return {
      bar: "linear-gradient(135deg, #22c55e, #16a34a)", // green
      bg: "#dcfce7"
    };
  }
};

const getUniqueAttendance = (attendance) => {
  const seen = new Set();

  return attendance.filter((a) => {
    const date = new Date(a.date).toDateString();

    // same batch + same date
    const key = `${date}-${a.batch_name}`;

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

const exportStudentProfilePDF = () => {
  const printWindow = window.open("", "_blank");

  const html = `
  <html>
  <head>
    <title>Student Profile Report</title>

    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 30px;
        color: #111;
      }

      /* HEADER */
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
        margin-bottom: 20px;
      }

      .logo {
        height: 60px;
        width: 160px;
      }

      .logo2 {
        height: 20px;
        width: 24px;
      }

      .logo3 {
        height: 17px;
        width: 21px;
      }

      .title {
        font-size: 26px;
        font-weight: bold;
        text-align: center;
        flex: 1;
      }

      /* SECTION TITLE */
      .section-title {
        margin-top: 25px;
        font-size: 20px;
        font-weight: 600;
        border-bottom: 1px solid #ddd;
        padding-bottom: 5px;
      }

      /* INFO GRID */
      .info {
        margin-top: 15px;
        line-height: 1.8;
      }

      .info span {
        display: inline-block;
        width: 125px;
        font-weight: bold;
      }

      /* ATTENDANCE BAR */
      .progress-container {
        width: 100%;
        height: 20px;
        background: #eee;
        border-radius: 10px;
        margin-top: 10px;
        overflow: hidden;
      }

      .progress-bar {
        height: 100%;
        background: #6366f1;
        text-align: center;
        color: white;
        font-size: 12px;
        line-height: 20px;
      }

      /* TABLE */
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
        table-layout: fixed;
      }

      th, td {
        border: 1px solid #333;
        padding: 8px;
        font-size: 15px;

        /* 🔥 TEXT WRAP */
        word-break: break-word;
        white-space: normal;
      }

      th {
        background: #cbd5f5;
      }

      /* STATUS */
      .present {
        color: green;
        font-weight: bold;
      }

      .absent {
        color: red;
        font-weight: bold;
      }

      /* FOOTER */
      .footer {
        margin-top: 25px;
        text-align: right;
        font-size: 12px;
        color: #444;
      }

    </style>
  </head>

  <body>

    <img src="${window.location.origin}/logo.png" class="logo"/>

    <div class="header">
      <div class="title"><img src="${window.location.origin}/profile.png" class="logo2"/> Student Profile Report</div>
    </div>

    <!-- STUDENT DETAILS -->
    <div class="section-title"><img src="${window.location.origin}/profile.png" class="logo3"/> Student Details</div>
    <div class="info">
      <p><b><span>Name:</span> ${profileData.student.name}</b></p>
      <p><b><span>Email:</span> ${profileData.student.email}</b></p>
      <p><b><span>Mobile:</span> ${profileData.student.mobile}</b></p>
      <p><b><span>Date of Birth:</span> ${formatDateTime(profileData.student.birth_date)}</b></p>
      <p><b><span>Attendance (%):</span> ${profileData.stats.percentage}%</b></p>
    </div>

    <!-- BATCH WISE -->
    <div class="section-title"><img src="${window.location.origin}/count.png" class="logo3"/> Batch Wise Attendance Count</div>
    <table>
      <thead>
        <tr>
          <th>Batch</th>
          <th>Present</th>
          <th>Absent</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${Object.values(
          getUniqueAttendance(profileData.attendance).reduce((acc, a) => {
            if (!acc[a.batch_name]) {
              acc[a.batch_name] = {
                batch: a.batch_name,
                present: 0,
                absent: 0,
                total: 0
              };
            }

            if (a.status === "Present") acc[a.batch_name].present++;
            else acc[a.batch_name].absent++;
            acc[a.batch_name].total++;
            return acc;
          }, {})
        ).map(b => `
          <tr>
            <td>${b.batch}</td>
            <td>${b.present} / ${b.total}</td>
            <td>${b.absent} / ${b.total}</td>
            <td>${b.total}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <!-- ATTENDANCE HISTORY -->
    <div class="section-title"><img src="${window.location.origin}/history.png" class="logo3"/> Attendance History</div>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Batch</th>
          <th>Time</th>
          <th>Topic</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${getUniqueAttendance(profileData.attendance).map(a => `
          <tr>
            <td>${formatDateTime(a.date)}</td>
            <td>${a.batch_name}</td>
            <td>${a.start_time} - ${a.end_time}</td>
            <td>${a.topic}</td>
            <td class="${a.status === "Present" ? "present" : "absent"}">
              ${a.status}
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <div class="footer">
      Generated on: ${new Date().toLocaleString()}
    </div>

  </body>
  </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.print();
  };
};

  return (
    <Layout>
      <div className="students-page">

        {/* HEADER */}
        <div className="students-header">
          {/* 🔥 HEADER FULL WIDTH */}
          <div className="attendance-header-new">
            <motion.div 
            className="header-icon-box center-icon"
            initial={{ x: 0, opacity: 0, scale: 0.6 }}
            animate={iconControls}
            >
              <FaUserGraduate />
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
              <h2 className="header-title">Students Management</h2>
              <b className="header-subtitle">
                Add and manage students efficiently
              </b>
            </motion.div>
          </div>

          <div className="header-actions">

            <input
              type="text"
              placeholder="🔍 Search Students...."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />

            <button className="pdf-btn" onClick={exportPDF}>
              <FaFilePdf /> Export PDF
            </button>

          </div>
        </div>

        <div className="students-grid">

          {/* FORM */}
          <div className="card-ui">
            <h3 className="form-title heading-icon">
              <FaUserPlus /> Add Student
            </h3>

            <div className="input-box">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                onFocus={handleFocus}
                placeholder="Full Name"
                className={errors.name ? "error" : ""}
              />
            </div>

            <div className="input-box">
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                onFocus={handleFocus}
                placeholder="Email-ID"
                className={errors.email ? "error" : ""}
              />
            </div>

            <div className="input-box">
              <input
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                onFocus={handleFocus}
                placeholder="Mobile No."
                maxLength="10"
                className={errors.mobile ? "error" : ""}
              />
            </div>

            <div className="input-box">
              <input
                 type="date"
                name="birth_date"
                value={form.birth_date}
                onChange={handleChange}
                onFocus={handleFocus}
                className={errors.birth_date ? "error" : ""}
              />
            </div>

            <button className="btn-primary" onClick={createStudent}>
              Create Student
            </button>
          </div>

          {/* TABLE */}
          <div className="card-ui">
            <h3 className="form-title heading-icon">
              <FaUsers /> Students
            </h3>

            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Date of Birth</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map(s => (
                  <tr key={s.id}>

                    {/* NAME */}
                    <td>
                      {editId === s.id ? (
                        <input className="edit-input" name="name" value={editData.name} onChange={handleEditChange} />
                      ) : s.name}
                    </td>

                    {/* EMAIL */}
                    <td>
                      {editId === s.id ? (
                        <input className="edit-input" name="email" value={editData.email} onChange={handleEditChange} />
                      ) : s.email}
                    </td>

                    {/* MOBILE */}
                    <td>
                      {editId === s.id ? (
                        <input className="edit-input" name="mobile" value={editData.mobile} onChange={handleEditChange} />
                      ) : `+91 ${s.mobile}`}
                    </td>

                    {/* DOB */}
                    <td>
                      {editId === s.id ? (
                        <input className="edit-input" type="date" name="birth_date" value={editData.birth_date} onChange={handleEditChange} />
                      ) : formatDate(s.birth_date)}
                    </td>

                    {/* ACTION */}
                    <td>
                      <div className="actions">

                        {editId === s.id ? (
                          <>
                            {/* SAVE */}
                            <div className="action-btn save" onClick={saveEdit}>
                              <FaCheck />
                            </div>

                            {/* CANCEL */}
                            <div className="action-btn cancel" onClick={cancelEdit}>
                              <FaTimes />
                            </div>
                          </>
                        ) : (
                          <>
                            {/* VIEW */}
                            <div className="action-btn view" onClick={() => openProfile(s.id)}>
                              <FaEye />
                            </div>

                            {/* EDIT */}
                            <div className="action-btn edit" onClick={() => startEdit(s)}>
                              <FaEdit />
                            </div>

                            {/* DELETE */}
                            <div className="action-btn delete" onClick={() => deleteStudentHandler(s.id)}>
                              <FaTrash />
                            </div>
                          </>
                        )}

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {profileData && (
          <div className="overlay">
            <div className="modal-view2">

              {/* HEADER */}
              <div className="modal-header-clean2">
                <div className="modal-icon">
                  <FaUserGraduate />
                </div>
                <div>
                  <h2>Student Profile</h2>
                  <b className="modal-subtitle">
                    Complete student attendance and details
                  </b>
                </div>
              </div>

              <div className="profile-container2">

                {/* LEFT */}
                <div className="left-box">

                  <h3 className="heading-icon3" style={{marginTop:"0px", color:"#395986"}}>
                    <FaIdCard /> Student Details
                  </h3>
                  <div className="view-row2"><span>Name<b>:</b></span><b>{profileData.student.name}</b></div>
                  <div className="view-row2"><span>Email<b>:</b></span><b>{profileData.student.email}</b></div>
                  <div className="view-row2"><span>Mobile<b>:</b></span><b>{profileData.student.mobile}</b></div>
                  <div className="view-row2"><span>Date of Birth<b>:</b></span><b>{formatDateTime(profileData.student.birth_date)}</b></div>
                  <div className="view-row2"><span><b>Attendance (%):</b></span></div>
                  {/* 🔥 PROGRESS BAR */}
                  {(() => {
                    const percentage = profileData.stats.percentage;
                    const style = getAttendanceStyle(percentage);

                    return (
                      <div
                        className="progress-bar modern-progress"
                        style={{
                          marginTop: "5px",
                          height: "25px",
                          position: "relative",
                          background: style.bg,
                          borderRadius: "20px",
                          overflow: "hidden"
                        }}
                      >

                        {/* 🔥 BAR */}
                        <motion.div
                          className="progress-fill-modern"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1 }}
                          style={{
                            background: style.bar,
                            height: "100%",
                            position: "absolute",
                            left: 0,
                            top: 0
                          }}
                        />

                        {/* 🔥 TEXT FRONT (white clipped inside bar) */}
                        <motion.span
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1 }}
                          style={{
                            position: "absolute",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textAlign: "center",
                            width: `${percentage}%`,
                            color: "white",
                            fontWeight: "600",
                            zIndex: 2,
                            marginTop:"3px"
                          }}
                        >
                          <span style={{ display: "inline-block", width: "100%" }}>
                            {percentage}%
                          </span>
                        </motion.span>

                      </div>
                    );
                  })()}

                  {/* 🔥 BATCH-WISE STATS */}
                  <div className="batch-stats-box">
                    <h4 style={{ marginBottom: "8px" }}>Batch Wise Attendance Count</h4>

                    <div className="batch-table-scroll">
                      <table className="batch-table">
                        <thead>
                          <tr>
                            <th>Batch</th>
                            <th>Present</th>
                            <th>Absent</th>
                            <th>Total</th>
                          </tr>
                        </thead>

                        <tbody>
                          {Object.values(
                            getUniqueAttendance(profileData.attendance)
                            .sort(
                              (a, b) =>
                                new Date(b.date) - new Date(a.date)
                            )
                            .reduce((acc, a) => {
                              if (!acc[a.batch_name]) {
                                acc[a.batch_name] = {
                                  batch: a.batch_name,
                                  present: 0,
                                  absent: 0,
                                  total: 0
                                };
                              }

                              if (a.status === "Present") acc[a.batch_name].present++;
                              else acc[a.batch_name].absent++;
                              acc[a.batch_name].total++; 
                              return acc;
                            }, {})
                          ).map((b, i) => (
                            <tr key={i}>
                              <td>{b.batch}</td>
                              <td style={{ color: "#22c55e", fontWeight: "600" }}>
                                {b.present} / {b.total}
                              </td>
                              <td style={{ color: "#ef4444", fontWeight: "600" }}>
                                {b.absent}  / {b.total}
                              </td>
                              <td style={{ fontWeight: "600" }}>
                                {b.total}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

                {/* RIGHT */}
                <div className="right-box">
                  <div className="attendance-header-row">
                    <h3 className="heading-icon3" style={{marginTop:"0px", color:"#395986"}}>
                      <FaHistory /> Attendance History
                    </h3>

                    <input
                      type="text"
                      placeholder="Search attendance...."
                      className="small-search"
                      value={profileSearch}
                      onChange={(e) => setProfileSearch(e.target.value)}
                    />
                  </div>
                  <div className="table-scroll3">
                    <table className="view-table2">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Batch</th>
                          <th>Time</th>
                          <th>Topic</th>
                          <th>Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {getUniqueAttendance(profileData.attendance)
                          .sort(
                            (a, b) =>
                              new Date(b.date) - new Date(a.date)
                          )
                          .filter(a => {
                            const val = profileSearch.toLowerCase().trim();

                            const formattedDate = formatDateTime(a.date).toLowerCase();

                            return (
                              a.batch_name?.toLowerCase().includes(val) ||
                              a.topic?.toLowerCase().includes(val) ||
                              a.status?.toLowerCase().includes(val) ||
                              formattedDate.includes(val) ||
                              `${a.start_time} - ${a.end_time}`.toLowerCase().includes(val)
                            );
                          })
                          .map((a, i) => (
                            <tr key={i}>
                              <td>{formatDateTime(a.date)}</td>
                              <td>{a.batch_name}</td>
                              <td>{a.start_time} - {a.end_time}</td>
                              <td>{a.topic}</td>
                              <td style={{
                                color: a.status === "Present" ? "#22c55e" : "#ef4444",
                                fontWeight: "600"
                              }}>
                                {a.status}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                </div>

              </div>

              {/* FOOTER */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "5px"
              }}>
                <button
                  className="btn cancel-btn"
                  onClick={() => setProfileData(null)}
                >
                  <FaTimes /><b>Close</b>
                </button>

                <button className="btn pdf-btn" onClick={exportStudentProfilePDF}>
                  <FaFilePdf /> Export PDF
                </button>
              </div>

            </div>
          </div>
        )}
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