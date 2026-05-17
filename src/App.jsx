import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Auth/Login";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import Dashboard from "./pages/Dashboard/Dashboard";
import Students from "./pages/Students/Students";
import Batches from "./pages/Batches/Batches";
import BatchDetails from "./pages/Batches/BatchDetails";
import Profile from "./pages/Profile/Profile";
import CreateUser from "./pages/User/CreateUser";
import Attendance from "./pages/Attendance/Attendance";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/batches" element={<Batches />} />
        <Route path="/batch/:id" element={<BatchDetails />} />
        <Route path="/create-user" element={<CreateUser />} />
        <Route path="/attendance" element={<Attendance />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;