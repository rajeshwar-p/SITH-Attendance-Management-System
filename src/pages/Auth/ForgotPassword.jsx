import { useState } from "react";
import API from "../../services/api";
import CommonPopup from "../../components/CommonPopup";

export default function ForgotPassword() {

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

  const [step, setStep] = useState(1);

  const [data, setData] = useState({
    username: "",
    otp: "",
    newPassword: ""
  });

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

  return (
    <div>
      <h2>Forgot Password</h2>

      {/* STEP 1 */}
      {step === 1 && (
        <>
          <input
            placeholder="Enter Username"
            onChange={(e) =>
              setData({ ...data, username: e.target.value })
            }
          />
          <button onClick={sendOTP}>Send OTP</button>
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <input
            placeholder="Enter OTP"
            onChange={(e) =>
              setData({ ...data, otp: e.target.value })
            }
          />

          <input
            placeholder="New Password"
            type="password"
            onChange={(e) =>
              setData({ ...data, newPassword: e.target.value })
            }
          />

          {/* 👇 IMPORTANT: show username */}
          <p>Username: {data.username}</p>

          <button onClick={resetPassword}>Reset Password</button>
        </>
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