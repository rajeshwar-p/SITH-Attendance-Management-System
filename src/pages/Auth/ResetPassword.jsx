import { useState } from "react";
import API from "../../services/api";
import CommonPopup from "../../components/CommonPopup";

export default function ResetPassword() {
  const [data, setData] = useState({
    username:"",
    otp:"",
    newPassword:""
  });

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

  const reset = async () => {
    await API.post("/auth/reset-password", data);
    showPopup("success","Password Updated");
  };

  return (
    <div>
      <input placeholder="Username" onChange={(e)=>setData({...data,username:e.target.value})}/>
      <input placeholder="OTP" onChange={(e)=>setData({...data,otp:e.target.value})}/>
      <input placeholder="New Password" onChange={(e)=>setData({...data,newPassword:e.target.value})}/>
      <button onClick={reset}>Reset</button>
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