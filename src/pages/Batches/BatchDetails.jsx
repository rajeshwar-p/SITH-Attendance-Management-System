import React from "react";
import Layout from "../../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../../services/api";
import { FaEye, FaTrash, FaEdit, FaFilePdf, FaCheck, FaTimes, FaLayerGroup, FaInfoCircle, FaClipboardList, FaFileAlt, FaUsers, FaUserCheck, FaUserPlus, FaUserMinus, FaUserGraduate, FaIdCard, FaHistory } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { motion, useAnimation } from "framer-motion";
import CommonPopup from "../../components/CommonPopup";

export default function BatchDetails() {

  const { id } = useParams();

  const [batch, setBatch] = useState({});
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [viewData, setViewData] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [editRecords, setEditRecords] = useState({});
  const [openEditRow, setOpenEditRow] = useState(null);
  const [openReasonId, setOpenReasonId] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fullData, setFullData] = useState(null);


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

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
    loadAttendance();
  }, [id]);

  useEffect(() => {
    if (showExportModal) {
      setFromDate("");
      setToDate("");
    }
  }, [showExportModal]);

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

  const clearError = (field) => {
    setEditErrors(prev => ({
      ...prev,
      [field]: false
    }));
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

  const loadData = async () => {
    try {
      const res1 = await API.get(`/batch/${id}`);
      const res2 = await API.get(`/students`);

      setBatch(res1.data);
      setStudents(res1.data.students || []);
      setAllStudents(res2.data);

      // pre-select existing students
      setSelected(res1.data.students.map(s => s.id));

    } catch {
      showPopup("error","Error in loading batch");
    }
  };

  // 🔥 Select toggle
  const toggleSelect = (studentId) => {
    setSelected(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // 🔥 Select All
  const selectAll = () => {
    if (selected.length === allStudents.length) {
      setSelected([]);
    } else {
      setSelected(allStudents.map(s => Number(s.id)));
    }
  };

  // 🔥 Save Students
  const saveStudents = async () => {
    try {
      await API.post("/batch/update-students", {
        batch_id: Number(id),   // ✅ correct batch id
        studentIds: selected     // ✅ correct selected list
      });

      showPopup("success","Students Updated");

      setShowModal(false);

      // 🔥 reload fresh data
      loadData();

    } catch (err) {
      showPopup("error","Error in updating students");
      console.log(err);
    }
  };

  const filteredStudents = allStudents.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const loadAttendance = async () => {
    try {
      const res = await API.get(`/attendance/batch/${id}`);
      setAttendanceList(res.data);
    } catch {
      showPopup("error","Error in loading attendance");
    }
  };

  const viewAttendance = async (id) => {
    const res = await API.get(`/attendance/${id}`);
    setViewData(res.data);
  };

  const deleteAttendance = (id) => {

    showPopup(
      "warning",
      "Delete attendance?",

      async () => {

        try {

          await API.delete(`/attendance/${id}`);

          showPopup(
            "success",
            "Attendance Deleted Successfully"
          );

          loadAttendance();

        } catch (err) {

          console.error(
            "DELETE ATTENDANCE ERROR:",
            err.response?.data || err.message
          );

          showPopup(
            "error",
            err.response?.data?.message ||
            "Failed to delete attendance"
          );
        }
      },

      true
    );
  };

  const startEdit = async (a) => {
    setEditId(a.id);
    setOpenEditRow(a.id);

    setEditData({
      id: a.id,
      date: toInputDate(a.date),
      start_time: a.start_time,
      end_time: a.end_time,
      topic: a.topic
    });

    // 🔥 LOAD FULL ATTENDANCE (STUDENTS)
    const res = await API.get(`/attendance/${a.id}`);

    let obj = {};

    // 🔥 pehle sabko default do
    students.forEach(s => {
      obj[s.id] = {
        status: "",
        reason: ""
      };
    });

    // 🔥 phir attendance data map karo
    res.data.students.forEach(s => {
      obj[Number(s.id)] = {
        status: s.status,
        reason: s.reason || ""
      };
    });

    setEditRecords(obj);
  };

  const saveEdit = async (attendanceId) => {

    let err = {};

    if (!editData.topic?.trim()) err.topic = true;
    if (!editData.date) err.date = true;
    if (!editData.start_time) err.start_time = true;
    if (!editData.end_time) err.end_time = true;

    setEditErrors(err);

    if (Object.keys(err).length > 0) {
      showPopup("warning","All fields are Required");
      return;
    }

    if (editData.end_time <= editData.start_time) {
      showPopup("warning","End time must be after start time");
      return;
    }

    // 🔥 DUPLICATE DATE CHECK
    const check = await API.get(
      `/attendance/check?batch_id=${id}&date=${editData.date}&exclude_id=${attendanceId}`
    );

    if (check.data.exists) {
      showPopup("warning","Another attendance already exists on this date");
      return;
    }

    // 🔥 STUDENT VALIDATION
    const empty = Object.values(editRecords).some(r => !r.status);
    if (empty) {
      showPopup("warning","Mark all Students Attendance");
      return;
    }

    await API.put(`/attendance/${attendanceId}`, {
      date: editData.date,
      start_time: editData.start_time,
      end_time: editData.end_time,
      topic: editData.topic,
      records: Object.keys(editRecords).map(id => ({
        student_id: Number(id),
        status: editRecords[id].status,
        reason: editRecords[id].reason
      }))
    });

    showPopup("success","Updated");

    setEditId(null);
    setOpenEditRow(null);
    loadAttendance();
  };

  const filteredAttendance = attendanceList.filter(a => {
    const value = search.toLowerCase();

    const formatted = formatDate(a.date).toLowerCase();     // 03-May-2026
    const raw = a.date?.toLowerCase();                      // 2026-05-03
    const time = `${a.start_time} ${a.end_time}`.toLowerCase();
    const topic = a.topic?.toLowerCase();

    return (
      formatted.includes(value) ||   // 🔥 month search (May, Apr)
      raw.includes(value) ||         // 🔥 full date search
      time.includes(value) ||        // 🔥 time search
      topic.includes(value)          // 🔥 topic search
    );
  });

  const generateBatchDetailsPDF = async () => {

    if (!fromDate || !toDate) {
      showPopup("warning","Select From and To date");
      return;
    }

    const res = await API.get(`/batch/full-details/${id}`);
    let data = res.data;

    // 🔥 FILTER BY DATE
    const sessions = data.sessions.filter(s => {
      return s.date >= fromDate && s.date <= toDate;
    });

    const printWindow = window.open("", "_blank");

    const html = `
    <html>
    <head>
      <title>Batch Report</title>

      <style>
        body {
          font-family: Arial;
          padding: 25px;
          color: #111;
        }
        
        .logo {
          height: 60px;
          width: 160px;
        }

        .logo2 {
          height: 20px;
          width: 20px;
        }

        .logo3 {
          height: 20px;
          width: 30px;
          margin-top:5px;
        }

        h1 {
          text-align: center;
          margin-bottom: 10px;
        }

        .section {
          margin-top: 25px;
        }

        .card {
          border: 2px solid #000;
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 8px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }

        th, td {
          border: 1px solid #333;
          padding: 8px;
          font-size: 14px;
        }

        th {
          background: #ddd;
        }

        .present {
          color: green;
          font-weight: bold;
        }

        .absent {
          color: red;
          font-weight: bold;
        }
      </style>
    </head>

    <body>

      <img src="${window.location.origin}/logo.png" class="logo"/>

      <h1 style="margin-bottom:20px; margin-top:0px;">Batch Detailed Report</h1>

      <div class="card">
        <h2>Batch Info</h2>
        <p><b>Name:</b> ${data.batch_name}</p>
        <p><b>Faculty:</b> ${data.faculty_name}</p>
        <p><b>Date Range:</b> ${formatDateTime(fromDate)} to ${formatDateTime(toDate)}</p>
      </div>

      <div class="card">
        <h2>Students List</h2>
        <table>
          <tr><th>#</th><th>Name</th></tr>
          ${data.students.map((s,i)=>`
            <tr>
              <td>${i+1}</td>
              <td>${s.name}</td>
            </tr>
          `).join("")}
        </table>
      </div>

      ${sessions.map((session,i)=>`
        <div class="card">
          <h2>Session ${i+1}</h2>

          <p><b>Date:</b> ${formatDateTime(session.date)}</p>
          <p><b>Time:</b> ${session.start_time} - ${session.end_time}</p>
          <p><b>Topic:</b> ${session.topic}</p>

          <table>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>

            ${session.students.map((s,j)=>`
              <tr>
                <td>${j+1}</td>
                <td>${s.name}</td>
                <td class="${s.status === "Present" ? "present" : "absent"}">
                  ${s.status}
                </td>
                <td>${s.reason || "-"}</td>
              </tr>
            `).join("")}

          </table>

        </div>
      `).join("")}

    </body>
    </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const exportPDF = () => {
    const printWindow = window.open("", "_blank");

    const html = `
    <html>
    <head>
      <title>Attendance Report</title>

      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 30px;
          color: #111;
        }

        /* 🔥 HEADER */
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
          width: 20px;
        }

        .logo3 {
          height: 20px;
          width: 30px;
          margin-top:5px;
        }

        .title {
          font-size: 26px;
          font-weight: bold;
          text-align: center;
          flex: 1;
        }

        /* 🔥 INFO SECTION */
        .info {
          margin-bottom: 30px;
          line-height: 1.6;
          margin-top: 20px
        }

        .info b {
          display: inline-block;
          width: 0px;
        }

        /* 🔥 TABLE */
        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          background: #c4c6ca;
          color: black;
          padding: 10px;
          text-align: left;
          font-size: 18px;
          border: 1.5px solid #272727;
        }

        td {
          padding: 10px;
          border: 1.5px solid #272727;
          font-size: 16px;
        }

        tr:nth-child(even) {
          background: #f9fafb;
        }

        /* 🔥 STATUS COLORS */
        .present {
          color: #16a34a;
          font-weight: bold;
        }

        .absent {
          color: #dc2626;
          font-weight: bold;
        }

        /* 🔥 FOOTER */
        .footer {
          margin-top: 30px;
          text-align: right;
          font-size: 12px;
          color: #3a3a3a;
        }

      </style>
    </head>

    <body>

      <img src="${window.location.origin}/logo.png" class="logo"/>

      <!-- 🔥 HEADER -->
      <div class="header">
        <div class="title"><img src="${window.location.origin}/attendance.png" class="logo3"/> Attendance Report</div>
      </div>

      <h2>
        <img src="${window.location.origin}/session.png" class="logo2"/> Session Information
      </h2>

      <!-- 🔥 INFO -->
      <div class="info">
        <p><h3>Batch:  ${batch.batch?.batch_name}</h3></p>
        <p><h3>Faculty:  ${batch.batch?.faculty_name}</h3></p>
        <p><h3>Date:  ${formatDateTime(viewData.attendance.date)}</h3></p>
        <p><h3>Time:  ${viewData.attendance.start_time} - ${viewData.attendance.end_time}</h3></p>
        <p><h3>Topic:  ${viewData.attendance.topic}</h3></p>
      </div>

      <h2>
        <img src="${window.location.origin}/attendance.png" class="logo3"/> Students Attendance
      </h2>

      <!-- 🔥 TABLE -->
      <table>
        <thead>
          <tr>
            <th style="width:40px">#</th>
            <th>Name</th>
            <th>Status</th>
            <th>Reason</th>
          </tr>
        </thead>

        <tbody>
          ${viewData.students.map((s, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${s.name}</td>
              <td class="${s.status === "Present" ? "present" : "absent"}">
                ${s.status}
              </td>
              <td>
                ${s.status === "Present"
                  ? "No reason required"
                  : (s.reason || "-")}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <!-- 🔥 FOOTER -->
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

  const navigate = useNavigate();
  
  const openProfile = async (id) => {
    try {
      const res = await API.get(`/students/full/${id}`);
      if (res.data) {
        setProfileData(res.data);
      } else {
        showPopup("error","No profile data found");
      }
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
  
    return attendance.filter(a => {
      const date = new Date(a.date).toDateString(); // same day normalize
  
      if (seen.has(date)) return false;
  
      seen.add(date);
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
        <p><b><span>Name:</span> ${profileData?.student?.name}</b></p>
        <p><b><span>Email:</span> ${profileData.student.email}</b></p>
        <p><b><span>Mobile:</span> ${profileData.student.mobile}</b></p>
        <p><b><span>Date of Birth:</span> ${formatDateTime(profileData.student.birth_date)}</b></p>
        <p><b><span>Attendance (%):</span> ${profileData?.stats?.percentage}%</b></p>
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
            getUniqueAttendance(profileData?.attendance || []).reduce((acc, a) => {
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
          ${getUniqueAttendance(profileData?.attendance || []).map(a => `
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
              <FaLayerGroup />
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
              <h2 className="header-title">Batch Details</h2>
              <b className="header-subtitle">
                Create and manage batches with students and faculty
              </b>
            </motion.div>
          </div>

          <div className="header-actions">
            <input
              type="text"
              placeholder="Search by date, time, or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />

            <button 
              className="pdf-btn"
              onClick={() => {
                setFromDate("");   // 🔥 reset
                setToDate("");     // 🔥 reset
                setShowExportModal(true);
              }}
            >
              <FaFilePdf /> Export PDF
            </button>
          </div>
        </div>

        <div className="students-grid">
          <div className="batch-layout">
            {/* LEFT SIDE */}
            <div className="left-section">
              <div className="card-ui">

                <h2 className="form-title heading-icon" style={{marginTop:"0px"}}>
                  <FaInfoCircle /> Batch Information
                </h2>

                <h3>Batch Name: {batch.batch?.batch_name}</h3>
                <h3>Faculty: {batch.batch?.faculty_name}</h3>

              </div>

              <div className="card-ui">

                <h3 className="form-title heading-icon students-title-row">
  
                  <div className="students-title-left">
                    <FaUsers />
                    <span>Students</span>
                  </div>

                  <div className="students-count-badge">
                    Total : {students.length}
                  </div>

                </h3>

                <div className="student-list-ui">

                  {students.length === 0 ? (
                    <p className="no-data">No students added</p>
                  ) : (
                    students.map((s, index) => (
                      <div key={s.id} className="student-item-ui" onClick={() => openProfile(s.id)}>

                        <div className="student-avatar">
                          {s.name.charAt(0)}
                        </div>

                        <div className="student-info">
                          <span className="student-name">{s.name}</span>
                        </div>

                      </div>
                    ))  
                  )}

                </div>

                <button className="btn add-student-btn right-btn" onClick={() => setShowModal(true)}>
                  <FaUserPlus/><b>Add</b> /<FaUserMinus/><b>Remove Students</b>
                </button>

              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="right-section">
            <div className="card-ui">

              <h3 className="form-title heading-icon" style={{marginTop:"0px"}}>
                <FaClipboardList  /> Attendence History
              </h3>

              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Topic</th>
                    <th>Time</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan="4">No records yet</td>
                    </tr>
                  ) : (filteredAttendance.map(a => (
                        <React.Fragment key={a.id}>
                        <tr key={a.id}>

                          {/* DATE */}
                          <td>
                            {editId === a.id ? (
                              <input
                                type="date"
                                className={`edit-input ${editErrors.date ? "error" : ""}`}
                                value={editData.date}
                                onFocus={() => clearError("date")}
                                onChange={(e) => {
                                  clearError("date");
                                  setEditData({ ...editData, date: e.target.value });
                                }}
                              />
                            ) : (
                              formatDate(a.date)
                            )}
                          </td>

                          {/* TOPIC */}
                          <td>
                            {editId === a.id ? (
                              <input
                                className={`edit-input ${editErrors.topic ? "error" : ""}`}
                                value={editData.topic}
                                onFocus={() => clearError("topic")}
                                onChange={(e) => {
                                  let value = e.target.value;

                                  // 🔥 AUTO CAPITALIZE EACH WORD
                                  value = value.replace(/\b\w/g, c => c.toUpperCase());

                                  clearError("topic");
                                  setEditData({ ...editData, topic: value });
                                }}
                              />
                            ) : (
                              a.topic
                            )}
                          </td>

                          {/* TIME */}
                          <td>
                            {editId === a.id ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <input
                                  type="time"
                                  className={`edit-input ${editErrors.start_time ? "error" : ""}`}
                                  value={editData.start_time}
                                  onFocus={() => clearError("start_time")}
                                  onChange={(e) => {
                                    clearError("start_time");
                                    setEditData({ ...editData, start_time: e.target.value });
                                  }}
                                />

                                <input
                                  type="time"
                                  className={`edit-input ${editErrors.end_time ? "error" : ""}`}
                                  value={editData.end_time}
                                  onFocus={() => clearError("end_time")}
                                  onChange={(e) => {
                                    clearError("end_time");
                                    setEditData({ ...editData, end_time: e.target.value })
                                  }}
                                />
                              </div>
                            ) : (
                              `${a.start_time} - ${a.end_time}`
                            )}
                          </td>

                          {/* ACTION */}
                          <td>
                            <div className="actions">

                              {editId === a.id ? (
                                <>
                                  <div className="action-btn save" onClick={() => saveEdit(a.id)}>
                                    <FaCheck />
                                  </div>

                                  <div
                                    className="action-btn cancel"
                                    onClick={() => {
                                      // 🔥 CLOSE EDIT MODE
                                      setEditId(null);
                                      setOpenEditRow(null);

                                      // 🔥 RESET TEMP STATES
                                      setEditData({});
                                      setEditRecords({});
                                      setEditErrors({});
                                      setOpenReasonId(null);
                                    }}
                                  >
                                    <FaTimes />
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="action-btn view" onClick={() => viewAttendance(a.id)}>
                                    <FaEye />
                                  </div>

                                  <div className="action-btn edit" onClick={() => startEdit(a)}>
                                    <FaEdit />
                                  </div>

                                  <div className="action-btn delete" onClick={() => deleteAttendance(a.id)}>
                                    <FaTrash />
                                  </div>
                                </>
                              )}

                            </div>
                          </td>

                        </tr>

                        {openEditRow === a.id && (
                          <tr key={`dropdown-${a.id}`}>
                            <td colSpan="4" style={{ padding: 0 }}>
                              
                              <div className="edit-dropdown">

                                <h4 style={{ marginBottom: "10px" }}>Edit Attendance</h4>

                                <div className="table-scroll2">
                                {students.map((s, index) => (
                                  <div key={s.id} className="student-row">

                                    <span>{index + 1}</span>
                                    <div>
                                      <span>{s.name}</span>

                                      {editRecords[s.id]?.reason && (
                                        <div
                                          style={{
                                            fontSize: "12px",
                                            marginTop: "4px",
                                            color:
                                              editRecords[s.id]?.status === "Absent"
                                                ? "#ef4444"   // 🔴 red for Absent
                                                : "#22c55e"   // 🟢 green for Present
                                          }}
                                        >
                                          Reason: {editRecords[s.id]?.reason}
                                        </div>
                                      )}
                                    </div>

                                    <div className="status-bar">

                                      <div
                                        className={`status-option ${editRecords[s.id]?.status === "Absent" ? "active" : ""}`}
                                        onClick={() => {
                                          setOpenReasonId(s.id);

                                          setEditRecords(prev => ({
                                            ...prev,
                                            [s.id]: {
                                              ...prev[s.id],
                                              status: "Absent"
                                            }
                                          }));
                                        }}
                                      >
                                        <span className="letter">A  →</span>
                                        <span>Absent</span> 
                                      </div>

                                      <div
                                        className={`status-option ${editRecords[s.id]?.status === "Present" ? "active" : ""}`}
                                        onClick={() => {
                                          setEditRecords(prev => ({
                                            ...prev,
                                            [s.id]: {
                                              status: "Present",
                                              reason: "No Reason Required"
                                            }
                                          }));
                                          setOpenReasonId(null);
                                        }}
                                      >
                                        <span className="letter">P  →</span>
                                        <span>Present</span>
                                      </div>

                                      <div className={`slider ${editRecords[s.id]?.status}`}></div>
                                    </div>

                                    {openReasonId === s.id && (
                                      <div className="reason-dropdown">
                                        <input
                                          placeholder="Enter reason"
                                          value={editRecords[s.id]?.reason || ""}
                                          onChange={(e) => {
                                            const value = e.target.value;

                                            setEditRecords(prev => ({
                                              ...prev,
                                              [s.id]: {
                                                ...prev[s.id],
                                                reason: value
                                              }
                                            }));
                                          }}
                                        />

                                        <button
                                          className="reason-save"
                                          onClick={() => {
                                            if (!editRecords[s.id]?.reason) {
                                              showPopup("warning","Enter reason to mark Absent");
                                              return;
                                            }

                                            setEditRecords(prev => ({
                                              ...prev,
                                              [s.id]: {
                                                status: "Absent",
                                                reason: prev[s.id].reason
                                              }
                                            }));

                                            setOpenReasonId(null);
                                          }}
                                        >
                                          Save
                                        </button>
                                      </div>
                                    )}

                                  </div>
                                ))}
                                </div>

                              </div>

                            </td>
                          </tr>
                        )}
                        </React.Fragment>
                        ))
                      )}
                      
                </tbody>
              </table>

            </div>
          </div>            
        </div>
        <div classname="Batch-Detail_Student-profile">
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
                    <div className="view-row2"><span>Name<b>:</b></span><b>{profileData?.student?.name}</b></div>
                    <div className="view-row2"><span>Email<b>:</b></span><b>{profileData.student.email}</b></div>
                    <div className="view-row2"><span>Mobile<b>:</b></span><b>{profileData.student.mobile}</b></div>
                    <div className="view-row2"><span>Date of Birth<b>:</b></span><b>{formatDateTime(profileData.student.birth_date)}</b></div>
                    <div className="view-row2"><span><b>Attendance (%):</b></span></div>
                    {/* 🔥 PROGRESS BAR */}
                    {(() => {
                      const percentage = profileData?.stats?.percentage;
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
                              getUniqueAttendance(profileData?.attendance || []).reduce((acc, a) => {
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
                          {getUniqueAttendance(profileData?.attendance || [])
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

        {/* 🔥 MODAL */}
        {showModal && (
          <div className="overlay">
            <div className="modal student-modal">

              {/* HEADER ROW */}
              <div className="modal-header">
                <h3 className="modal-title">
                  Select Students ({selected.length})
                </h3>

                <button className="btn select-all-btn" onClick={selectAll}>
                  <b>{selected.length === allStudents.length ? "Unselect" : "Select All"}</b>
                </button>
              </div>

              {/* SEARCH */}
              <input
                type="text"
                placeholder="Search Students..."
                className="search-student"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {/* LIST */}
              <div className="table-scroll">
              <div className="student-list">
                {filteredStudents.length === 0 && (
                  <p className="no-data">No student found</p>
                )}

                {filteredStudents.map(s => (
                  <label key={s.id} className="student-item">
                    <input
                      type="checkbox"
                      checked={selected.includes(s.id)}
                      onChange={() => toggleSelect(s.id)}
                    />
                    <span>{s.name}</span>
                  </label>
                ))}
              </div>
              </div>

              {/* FOOTER */}
              <div className="modal-footer">
                <button className="btn save-btn" onClick={saveStudents}>
                  <b>{students.length > 0 ? "Update" : "Save"}</b>
                </button>

                <button
                  className="btn cancel-btn"
                  onClick={() => {
                    setShowModal(false);

                    // 🔥 RESET STATE (important)
                    setSelected(students.map(s => s.id));
                    setSearch("");
                  }}
                >
                  <FaTimes/><b>Cancel</b>
                </button>
              </div>

            </div>
          </div>
        )}

        {viewData && (
          <div className="overlay">
            <div className="modal-view">

              <div className="modal-header-clean">
                <div className="modal-icon">
                  <FaFileAlt />
                </div>
                <div>
                  <h2>Attendance Detail</h2>
                  <b className="modal-subtitle">
                    View complete attendance record with status and reasons
                  </b>
                </div>
              </div>

              <h3 className="heading-icon2" style={{marginTop:"0px", color:"#395986"}}>
                <FaInfoCircle /> Session Information
              </h3>

              <div className="view-row">
                <span>Batch<b>:</b></span>
                <b>{batch.batch?.batch_name}</b>
              </div>

              <div className="view-row">
                <span>Faculty<b>:</b></span>
                <b>{batch.batch?.faculty_name}</b>
              </div>

              <div className="view-row">
                <span>Date & Time<b>:</b></span>
                <b>
                  {formatDateTime(viewData.attendance.date)} |  
                  {viewData.attendance.start_time} - {viewData.attendance.end_time}
                </b>
              </div>

              <div className="view-row">
                <span>Topic<b>:</b></span>
                <b>{viewData.attendance.topic}</b>
              </div>

              <div></div>

              <h3 className="heading-icon2" style={{marginTop:"0px", color:"#395986"}}>
                <FaUserCheck /> Students Attendance
              </h3>

              <div className="table-scroll">
              <table className="view-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Reason</th>
                  </tr>
                </thead>

                <tbody>
                  {viewData.students.map((s, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{s.name}</td>

                      <td style={{
                        color: s.status === "Present" ? "#22c55e" : "#ef4444",
                        fontWeight: "600"
                      }}>
                        {s.status}
                      </td>

                      <td>
                        {s.status === "Present"
                          ? "No reason required"
                          : s.reason || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>    

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "20px"
              }}>
                <button
                  className="btn cancel-btn"
                  onClick={() => setViewData(null)}
                >
                  <FaTimes /> <b>Close</b>
                </button>

                <button
                  className="btn pdf-btn"
                  onClick={exportPDF}
                >
                  <FaFilePdf /> Export PDF
                </button>
              </div>

            </div>
          </div>
        )}

        {showExportModal && (
          <div className="overlay">
            <div className="modal-view3">

              <h3 className="modal-title">Select Date Range</h3>

              <div className="date-field">
                <label>From</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="edit-input"
                />
              </div>

              <div className="date-field">
                <label>To</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="edit-input"
                />
              </div>

              <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
                <button
                  className="btn save-btn"
                  onClick={() => {
                    generateBatchDetailsPDF();
                    setShowExportModal(false);
                  }}
                >
                  <b>Generate PDF</b>
                </button>

                <button
                  className="btn cancel-btn"
                  onClick={() => setShowExportModal(false)}
                >
                  <FaTimes/><b>Cancel</b>
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