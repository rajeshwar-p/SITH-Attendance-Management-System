import Layout from "../../components/Layout";
import { useEffect, useState } from "react";
import API from "../../services/api";
import { motion, useAnimation } from "framer-motion";
import { FaUser, FaLayerGroup, FaCheckCircle, FaTimesCircle, FaBirthdayCake, FaChartBar, FaChartLine, FaWhatsapp, FaTimes } from "react-icons/fa";
import CommonPopup from "../../components/CommonPopup";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

export default function Dashboard() {
  const [data, setData] = useState({});
  const [sentWishes, setSentWishes] = useState({});
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

  const user = JSON.parse(localStorage.getItem("user"));

  const getWhatsappMessage = (name) => {
    return `✨*Happy Birthday ${name}!*✨
  🎉🎂🎁🎈🥳🎊
  On Your Special Day May God Bless You with lots of
  Happiness 😊,
  Joy 😂,
  Peace ✌🏻,
  Success 🏆💯 and
  💪 Good Health 👍...
  Wish you a great year ahead 👍🏻😊

  Warm Regards,
  *SITH*
  *(Suhradam Information Technology Hub).*`;
  };

  const formatMessageForWhatsApp = (msg) => {
    return msg.replace(/\n/g, "%0A");
  };

  useEffect(() => {
    API.get("/dashboard")
      .then(res => setData(res.data))
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

  return (
    <Layout>
      {/* 🔥 HEADER FULL WIDTH */}
      <div className="attendance-header-new-dash">
      
        <motion.div 
        className="header-icon-box center-icon"
        initial={{ x: 0, opacity: 0, scale: 0.6 }}
        animate={iconControls}
        >
          <FaChartLine />
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
          <h2 className="header-title">Dashboard</h2>
          <b className="header-subtitle">
            Monitor attendance, batches and overall activity at a glance
          </b>
        </motion.div>
      
      </div>

      {/* CARDS */}
      <div style={{ display: "flex", gap: "25px", marginTop: "20px", flexWrap: "wrap" }}>
        <Card icon={<FaUser color="#6366f1" />} title="Total Students" value={data.totalStudents || 0} />
        <Card icon={<FaLayerGroup color="#6366f1"/>} title="Total Batches" value={data.totalBatches || 0} />
        <Card icon={<FaCheckCircle color="#3fa310"/>} title="Today's Total Present" value={data.todayPresent || 0} />
        <Card icon={<FaTimesCircle color="#ca0d0d"/>} title="Today's Total Absent" value={data.todayAbsent || 0} />
      </div>

      {/* BIRTHDAY */}
      <div className="section">
        <h2 style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "20px",
          fontWeight: "600",
          color: "#395986"
        }}>
          <FaBirthdayCake size={20} color="#f59e0b" />
          Today's Birthday Students
        </h2>

        {data.birthdays?.length === 0 && <p>No birthdays today...!</p>}

        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
          {data.birthdays?.map((s) => (
            <motion.div
              key={s.id}
              whileHover={{ scale: 1.05 }}
              className="birthday-card"
              style={{ width: "220px" }}
            >
              <h4 style={{ margin: "0" }}>{s.name}</h4>

              <div className="wish-btn-wrapper" style={{ marginTop: "20px" }}>
                <button
                  className={`whatsapp-btn 
                    ${sentWishes[s.id] ? "sent" : ""} 
                    ${user?.role !== "Admin" ? "disabled-btn" : ""}
                  `}
                  
                  disabled={user?.role !== "Admin"}

                  title={
                    user?.role !== "Admin"
                      ? "Only Admin can send birthday wishes"
                      : "Send Birthday Wishes"
                  }

                  onClick={() => {

                    if (user?.role !== "Admin") return;

                    const msg = getWhatsappMessage(s.name);
                    const formatted = formatMessageForWhatsApp(msg);

                    window.open(
                      `https://api.whatsapp.com/send?phone=91${s.mobile}&text=${formatted}`
                    );

                    setSentWishes(prev => ({
                      ...prev,
                      [s.id]: true
                    }));

                  }}
                >
                  <FaWhatsapp className="wa-icon" />
                  <span>
                    {sentWishes[s.id] ? "Wishes Sent" : "Send Wishes"}
                  </span>
                </button>
              </div>

            </motion.div>
          ))}
        </div>
      </div>

      {/* GRAPH */}
      <div className="section">
        <h3 style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "20px",
          fontWeight: "600",
          color: "#395986"
        }}>
          <FaChartBar size={20} color="#6366f1" />
          Batch-wise Students
        </h3>

        <div style={{
          width: "100%",
          height: "400px",
          minHeight: "400px",
          overflow: "visible"
        }}>
          <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={data.batchStats || []}
            barCategoryGap="20%"
            barGap={10}
            margin={{
              top: 20,
              right: 30,
              left: 10,
              bottom: 90
            }}
          >
              <XAxis
                dataKey="batch_name"
                interval={0}
                angle={-20}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="total"
                fill="#6366f1"
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
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

function Card({ icon, title, value }) {
  return (
    <div className="card">

      {/* TOP LINE */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "15px"
      }}>
        <span style={{ fontSize: "18px" }}>{icon}</span>
        <h3 style={{ margin: 0, color: "#395986" }}>{title}</h3>
      </div>

      {/* VALUE */}
      <h1 style={{
        margin: 0,
        fontSize: "35px",
        fontWeight: "bold"
      }}>
        {value}
      </h1>

    </div>
  );
}