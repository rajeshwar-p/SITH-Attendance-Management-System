import Layout from "../../components/Layout";
import { useEffect, useState } from "react";
import API from "../../services/api";
import { FaEye, FaEdit, FaTrash, FaCheck, FaTimes, FaFilePdf, FaClipboardList, FaListUl, FaPlusCircle, FaLayerGroup } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import CommonPopup from "../../components/CommonPopup";

export default function Batches() {

  const [batches, setBatches] = useState([]);
  const [facultyList, setFacultyList] = useState([]);

  const [form, setForm] = useState({ name: "", faculty: "" });
  const [errors, setErrors] = useState({});

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState("all");

  const [search, setSearch] = useState("");

  const navigate = useNavigate();

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
    loadBatches();
    loadFaculty();
  }, []);

  useEffect(() => {
    if (showExportModal) {
      setSelectedBatchId("all");  // reset
      loadBatches();              // reload data
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

  const loadBatches = async () => {
    const res = await API.get("/batch");
    setBatches(res.data);
  };

  const loadFaculty = async () => {
    const res = await API.get("/user/staff");
    setFacultyList(res.data);
  };

  // ================= CREATE =================
  const validate = () => {
    let err = {};

    if (!form.name.trim()) {
      err.name = "Batch name required";
    }

    if (!form.faculty) {
      err.faculty = "Faculty required";
    }

    // 🔥 DUPLICATE CHECK
    const exists = batches.find(
      b => b.batch_name.toLowerCase() === form.name.toLowerCase()
    );

    if (exists) {
      err.name = "Batch already exists";
      showPopup("warning","Batch already exists");
    }

    setErrors(err);

    if (Object.keys(err).length > 0) {
      showPopup("warning",Object.values(err)[0]);
      return false;
    }

    return true;
  };

  const createBatch = async () => {
    if (!validate()) return;

    try {
      await API.post("/batch", {
        batch_name: form.name,
        faculty_id: form.faculty
      });

      showPopup("success","Batch Created");

      setForm({ name: "", faculty: "" });
      loadBatches();

    } catch {
      showPopup("error","Error in creating batch");
    }
  };

  // ================= EDIT =================
  const startEdit = (b) => {
    setEditId(b.id);
    setEditData({
      batch_name: b.batch_name,
      faculty_id: b.faculty_id || ""   // 🔥 important
    });
  };

  const validateEdit = () => {
    let err = {};

    if (!editData.batch_name?.trim()) {
      err.name = "Batch name required";
    }

    if (!editData.faculty_id) {
      err.faculty = "Faculty required";
    }

    const exists = batches.find(
      b =>
        b.batch_name.toLowerCase() === editData.batch_name.toLowerCase() &&
        b.id !== editId
    );

    if (exists) {
      showPopup("warning","Batch already exists");
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    // ✅ Capitalize every word
    if (name === "name") {
      value = value.replace(/\b\w/g, c => c.toUpperCase());
    }

    setForm(prev => ({ ...prev, [name]: value }));

    // remove error on focus
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const saveEdit = async () => {
    if (!validateEdit()) return;

    await API.put(`/batch/${editId}`, editData);

    showPopup("success","Updated");

    setEditId(null);
    loadBatches();
  };

  const cancelEdit = () => {
    setEditId(null);
  };

  // ================= DELETE =================
  const deleteBatchHandler = (id) => {

    showPopup(
      "warning",
      "Delete this batch?",

      async () => {

        try {

          await API.delete(`/batch/${id}`);

          setBatches(prev =>
            prev.filter(b => b.id !== id)
          );

          showPopup(
            "success",
            "Batch deleted successfully"
          );

        } catch (err) {

          console.error(
            "DELETE ERROR:",
            err.response?.data || err.message
          );

          showPopup(
            "error",
            err.response?.data?.message ||
            "Failed to delete batch"
          );
        }
      },

      true
    );
  };

  // ================= SEARCH =================
  const filtered = batches
  .filter(b => {
    const val = search.toLowerCase();

    return (
      b.batch_name?.toLowerCase().includes(val) ||
      b.faculty_name?.toLowerCase().includes(val)
    );
  })
  .sort((a, b) =>
    a.batch_name.localeCompare(
      b.batch_name,
      undefined,
      {
        numeric: true,
        sensitivity: "base"
      }
    )
  );

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

  const exportBatchPDF = async (batchId) => {

    try {

    let data = [];

    if (batchId === "all") {
      const res = await API.get("/batch/full");
      data = res.data;
    } else {
      const res = await API.get(`/batch/full/${batchId}`);
      data = [res.data];
    }

    if (!data || data.length === 0) {
      showPopup("info","No data found");
      return;
    }

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      showPopup("warning","Popup blocked! Allow popups.");
      return;
    }

    const html = `
    <html>
    <head>

      <title>Batch Report</title>

      <style>
        body {
          font-family: Arial;
          padding: 25px;
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
          margin-bottom: 20px;
        }

        .batch-card {
          border: 2px solid #000;
          margin-bottom: 25px;
          padding: 15px;
          border-radius: 8px;
        }

        .title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .info {
          margin-bottom: 10px;
        }

        .info b {
          display: inline-block;
          width: 150px;
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

        .section {
          margin-top: 15px;
          font-weight: bold;
          font-size: 16px;
        }

      </style>
    </head>

    <body>

      <img src="${window.location.origin}/logo.png" class="logo"/>

      <h1 style="margin-bottom:20px; margin-top:0px;">Batch Management Report</h1>

      ${data.map((b, index) => `
        <div class="batch-card">

          <div class="title">Batch ${index + 1}: ${b.batch_name}</div>

          <div class="info">
            <div><b>Faculty:</b> ${b.faculty_name}</div>
            <div><b>Total Students:</b> ${b.students.length}</div>
            <div><b>Total Sessions:</b> ${b.sessions.length}</div>
          </div>

          <div class="section">Students List</div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              ${b.students.map((s, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${s.name}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="section">Sessions / Lectures</div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Time</th>
                <th>Topic</th>
              </tr>
            </thead>
            <tbody>
              ${b.sessions.map((s, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${formatDateTime(s.date)}</td>
                  <td>${s.start_time} - ${s.end_time}</td>
                  <td>${s.topic}</td>
                </tr>
              `).join("")}
            </tbody>
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
    } catch (err) {
        console.error(err);
        showPopup("error","PDF generation failed");
      }
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
              <h2 className="header-title">Batch Management</h2>
              <b className="header-subtitle">
                Create and manage batches with students and faculty
              </b>
            </motion.div>
          </div>

          <div className="header-actions">
            <input
              className="search-input"
              placeholder="Search Batches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button className="pdf-btn" 
              onClick={() => {
                setSelectedBatchId("all");   // 🔥 reset dropdown
                loadBatches();               // 🔥 fresh data
                setShowExportModal(true);
              }}
            >
              <FaFilePdf /> Export PDF
            </button>
          </div>
        </div>

        <div className="students-grid">

          {/* FORM */}
          <div className="card-ui">
            <h3 className="form-title heading-icon">
              <FaPlusCircle /> Add Batch
            </h3>

            <div className="input-box">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Batch Name"
                className={errors.name ? "error" : ""}
              />
            </div>
              
            <select
              name="faculty"
              value={form.faculty}
              onChange={(e) => {
                setForm({ ...form, faculty: e.target.value });
                setErrors(prev => ({ ...prev, faculty: "" }));
              }}
              className={errors.faculty ? "error" : ""}
            >
              <option value="">Select Faculty</option>

              {[...facultyList]
              .sort((a, b) =>
                a.name.localeCompare(
                  b.name,
                  undefined,
                  {
                    numeric: true,
                    sensitivity: "base"
                  }
                )
              )
              .map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.role})
                </option>
              ))}
            </select>

            <button className="btn-primary" onClick={createBatch}>
              Create Batch
            </button>
          </div>

          {/* TABLE */}
          <div className="card-ui">
            <h3 className="form-title heading-icon">
              <FaListUl /> Batch List
            </h3>

            <table>
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Faculty</th>
                  <th style={{textAlign:"center", padding:"4px"}}>Total Students</th>
                  <th style={{textAlign:"center", padding:"4px"}}>Total Lectures/Sessions</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>

                    {/* NAME */}
                    <td>
                      {editId === b.id ? (
                        <input
                          className="edit-input"
                          value={editData.batch_name}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              batch_name: e.target.value.replace(/\b\w/g, c => c.toUpperCase())
                            })
                          }
                        />
                      ) : b.batch_name}
                    </td>
                    
                    {/* FACULTY */}
                    <td>
                      {editId === b.id ? (
                        <select
                          className="edit-input"
                          value={editData.faculty_id}
                          onChange={(e) =>
                            setEditData({ ...editData, faculty_id: e.target.value })
                          }
                        >
                          <option value="">Select Faculty</option>

                          {[...facultyList]
                          .sort((a, b) =>
                            a.name.localeCompare(
                              b.name,
                              undefined,
                              {
                                numeric: true,
                                sensitivity: "base"
                              }
                            )
                          )
                          .map(f => (
                            <option key={f.id} value={f.id}>
                              {f.name} ({f.role})
                            </option>
                          ))}
                        </select>
                      ) : b.faculty_name}
                    </td>

                    <td><div className="session-count-badge">{b.total_students}</div></td>

                    <td>
                      <div className="session-count-badge">
                        {b.total_sessions}
                      </div>
                    </td>

                    {/* ACTION */}
                    <td>
                      <div className="actions">

                        {editId === b.id ? (
                          <>
                            <div className="action-btn save" onClick={saveEdit}>
                              <FaCheck />
                            </div>

                            <div className="action-btn cancel" onClick={cancelEdit}>
                              <FaTimes />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="action-btn view"
                              onClick={() => navigate(`/batch/${b.id}`)}>
                              <FaEye />
                            </div>

                            <div className="action-btn edit"
                              onClick={() => startEdit(b)}>
                              <FaEdit />
                            </div>

                            <div className="action-btn delete"
                              onClick={() => deleteBatchHandler(b.id)}>
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

        {showExportModal && (
          <div className="overlay">
            <div className="modal-view3">

              <h3 className="modal-title">Select Batch for Export</h3>

              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="edit-input"
                style={{height:"60px"}}
              >
                <option value="all">All Batches</option>

                {[...batches]
                .sort((a, b) =>
                  a.batch_name.localeCompare(
                    b.batch_name,
                    undefined,
                    {
                      numeric: true,
                      sensitivity: "base"
                    }
                  )
                )
                .map(b => (
                  <option key={b.id} value={b.id}>
                    {b.batch_name}
                  </option>
                ))}
              </select>
              
              <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
                <button
                  className="btn save-btn"
                  onClick={() => {
                    exportBatchPDF(selectedBatchId);
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