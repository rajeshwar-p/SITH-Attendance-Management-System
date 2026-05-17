import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Navbar toggleSidebar={() => setOpen(!open)} />

      {/* SIDEBAR */}
      <Sidebar open={open} toggleSidebar={() => setOpen(false)} />

      {/* OVERLAY */}
      {open && (
        <div
          className="overlay"
          onClick={() => setOpen(false)}
        ></div>
      )}

      <div className="main">
        {children}
      </div>

      <Footer />
    </>
  );
}