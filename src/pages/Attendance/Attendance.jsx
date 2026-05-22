import Layout from "../../components/Layout";
import { useEffect, useState } from "react";
import API from "../../services/api";
import { FaClipboardList, FaUserCheck, FaLayerGroup } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { MdRefresh } from "react-icons/md";
import { motion, useAnimation } from "framer-motion";
import CommonPopup from "../../components/CommonPopup";

export default function Attendance() {

  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState("");
  const [errors, setErrors] = useState({});
  const [studentError, setStudentError] = useState(false);
  const [openReasonId, setOpenReasonId] = useState(null);

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

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    start_time: "",
    end_time: "",
    topic: ""
  });

  const [records, setRecords] = useState({});

  useEffect(() => {
    loadBatches();
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

  const loadBatches = async () => {
    try {
      const res = await API.get("/batch");
      console.log("BATCHES:", res.data); // 👈 CHECK THIS
      setBatches(res.data);
    } catch (err) {
      console.error("Batch load error:", err);
    }
  };

  const handleBatchChange = async (id) => {
    // ❌ Agar empty ya invalid ho toh API call mat karo
    if (!id || id === "Select Batch") return;

    try {
      setSelectedBatch(id);

      const res = await API.get(`/batch/${id}`);

      setStudents(res.data.students || []);
      setFaculty(res.data.batch?.faculty_name || "");

      let obj = {};
      (res.data.students || []).forEach(s => 
        obj[s.id] = { status: "", reason: "" }
      );
      setRecords(obj);

    } catch (err) {
      console.error("Batch fetch error:", err);
    }
  };

  // 🔥 Toggle Present / Absent
  const toggleStatus = (id) => {
    setRecords(prev => ({
      ...prev,
      [id]: {
        status: prev[id]?.status === "Present" ? "Absent" : "Present",
        reason: prev[id]?.status === "Present" ? prev[id]?.reason : "Reason Not Required"
      }
    }));
  };

  const validate = () => {
    let newErrors = {};

    if (!selectedBatch) newErrors.batch = true;
    if (!form.date) newErrors.date = true;
    if (!form.start_time) newErrors.start_time = true;
    if (!form.end_time) newErrors.end_time = true;
    if (!form.topic) newErrors.topic = true;

    const emptyStudents = Object.values(records).some(v => !v.status);

    setErrors(newErrors);
    setStudentError(emptyStudents);

    if (Object.keys(newErrors).length > 0 || emptyStudents) {
      showPopup("warning","All fields are required and mark all Students Attendance");
      return false;
    }

    return true;
  };

  const submit = async () => {

    if (!validate()) return;

    try {

      // 🔥 CHECK ALREADY EXISTS
      const check = await API.get(
        `/attendance/check?batch_id=${selectedBatch}&date=${form.date}`
      );

      if (check.data.exists) {
        showPopup(
          "warning",
          "Attendance already marked for this date"
        );
        return;
      }

      const payload = {
        batch_id: selectedBatch,
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        topic: form.topic,

        records: Object.keys(records)
        .filter(id => records[id]?.status)
        .map(id => ({
          student_id: Number(id),
          status: records[id].status,
          reason:
            records[id].status === "Present"
              ? null
              : records[id].reason || "Reason Not Required"
        }))
      };

      await API.post("/attendance/create", payload);

      // ✅ SUCCESS POPUP
      showPopup(
        "success",
        "Attendance Saved Successfully",

        async () => {

          // 🔥 RESET STATES
          setSelectedBatch("");
          setStudents([]);
          setFaculty("");

          setForm({
            date: new Date().toISOString().split("T")[0],
            start_time: "",
            end_time: "",
            topic: ""
          });

          setRecords({});
          setErrors({});
          setStudentError(false);
          setOpenReasonId(null);

          loadBatches();
        }
      );

    } catch (err) {

      console.error(
        "ATTENDANCE ERROR:",
        err.response?.data || err.message
      );

      showPopup(
        "error",
        err.response?.data?.message ||
        "Error in submitting attendance"
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
          <FaClipboardList />
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
          <h2 className="header-title">Attendance</h2>
          <b className="header-subtitle">
            Mark and manage daily attendance efficiently
          </b>
        </motion.div>

      </div>

    <div className="attendance-wrapper">

      {/* 🔥 LEFT CARD (TOP LEFT) */}
      <div className="attendance-left card-ui">

        <h3 className="form-title heading-icon">
          <FaLayerGroup /> Attendance Setup
        </h3>
        <div className="input-box">
          <label>Batch</label>
          <select
            value={selectedBatch}
            onChange={(e)=>{
              handleBatchChange(e.target.value);
              setErrors(prev => ({...prev, batch: false}));
            }}
            className={errors.batch ? "error" : ""}
          >
            <option value="">Select Batch</option>
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
              <option key={b.id} value={b.id}>{b.batch_name}</option>
            ))}
          </select>
        </div>

        <div className="input-box">
          <label>Faculty</label>
          <input value={faculty || "Select Batch Name..."} disabled />
        </div>

        <div className="input-box">
          <label>Date</label>
          <input type="date"
            value={form.date}
            className={errors.date ? "error" : ""}
            onChange={(e)=>{
              setForm({...form, date: e.target.value});
              setErrors(prev => ({...prev, date: false})); // ✅ remove error instantly
            }}
          />
        </div>

        <div className="input-box">
          <label>Start Time</label>
          <input type="time"
            className={errors.start_time ? "error" : ""}
            value={form.start_time}
            onChange={(e)=>{
              setForm({...form,start_time:e.target.value});
              setErrors(prev => ({...prev, start_time: false}));
            }}
          />
        </div>

        <div className="input-box">
          <label>End Time</label>
          <input type="time"
            className={errors.end_time ? "error" : ""}
            value={form.end_time}
            onChange={(e)=>{
              setForm({...form,end_time:e.target.value});
              setErrors(prev => ({...prev, end_time: false}));
            }}
          />
        </div>

        <div className="input-box">
        <label>Topic</label>
        <input
          value={form.topic}
          className={errors.topic ? "error" : ""}
          onChange={(e)=>{
            const value = e.target.value;

            setForm({
              ...form,
              topic: value
            });

            setErrors(prev => ({
              ...prev,
              topic: false
            }));
          }}
        />
      </div>

      </div>

      {/* 🔥 RIGHT CARD (BOTTOM RIGHT) */}
      <div className="attendance-right card-ui">

        <h3 className="form-title heading-icon">
          <FaUserCheck /> Mark Attendance
        </h3>
        
        <div className="table-head">
          <span>Sr.No</span>
          <span>Name</span>
          <span>Status</span>
        </div>

        {[...students]
        .sort((a, b) =>
          a.name.localeCompare(
            b.name,
            undefined,
            {
              sensitivity: "base"
            }
          )
        )
        .map((s, index) => (
          <div
            key={`${s.id}-${index}`}
            className={`student-row ${
              studentError && !records[s.id]?.status
                ? "student-error"
                : ""
            }`}
          >

            <span className="sr">{index + 1}</span>

            <div>
              <span className="name">{s.name}</span>

              {records[s.id]?.reason && (
                <div
                  style={{
                    fontSize: "12px",
                    marginTop: "4px",
                    color:
                      records[s.id]?.status === "Absent"
                        ? "#ef4444"   // 🔴 Absent
                        : "#22c55e"   // 🟢 Present
                  }}
                >
                  Reason: {
                    records[s.id]?.status === "Present"
                      ? "No Reason Required"
                      : records[s.id]?.reason
                  }
                </div>
              )}
            </div>

            <div className="status-bar">

              <div
                className={`status-option left ${records[s.id]?.status === "Absent" ? "active" : ""}`}
                onClick={()=>{
                  setOpenReasonId(s.id);
                }}
              >
                <span className="letter">A  →</span>
                <span>Absent</span>
              </div>

              <div
                className={`status-option right ${records[s.id]?.status === "Present" ? "active" : ""}`}
                onClick={()=>{
                  setRecords(prev => ({
                    ...prev,
                    [s.id]: {
                      status: "Present",
                      reason: "Reason Not Required"
                    }
                  }));

                  setOpenReasonId(null);
                  setStudentError(false);
                }}
              >
                <span className="letter">P  →</span>
                <span>Present</span>
              </div>

              <div className={`slider ${records[s.id]?.status}`}></div>

            </div>

            {openReasonId === s.id && (
              <div className="reason-dropdown">

                <input
                  type="text"
                  placeholder="Enter reason..."
                  value={records[s.id]?.reason || ""}
                  onChange={(e)=>{
                    const value = e.target.value;

                    setRecords(prev => ({
                      ...prev,
                      [s.id]: {
                        ...prev[s.id],
                        reason: value
                      }
                    }));
                  }}
                />

                <button
                  onClick={() => {
                    if (!records[s.id]?.reason) {
                      showPopup("warning","Enter reason for marking Absent");
                      return;
                    }

                    setRecords(prev => ({
                      ...prev,
                      [s.id]: {
                        status: "Absent",
                        reason: prev[s.id].reason
                      }
                    }));

                    setOpenReasonId(null);
                  }}
                  className="reason-save"
                >
                  <b>Save</b>
                </button>

              </div>
            )}

          </div>
        ))}

        <p className="attendance-warning">
          ⚠ Please mark attendance for all students before submitting
        </p>

        <div className="btn-row2 right-btn">
          <button className="btn-small" onClick={submit}>
            <span className="btn-content">
              <IoMdSend />
              <b>Submit Attendance</b>
            </span>
          </button>

          <button className="btn-reset" onClick={()=>window.location.reload()}>
            <span className="btn-content">
              <MdRefresh />
              <b>Reset</b>
            </span>
          </button>
        </div>
      </div>

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