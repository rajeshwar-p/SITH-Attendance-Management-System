import Layout from "../../components/Layout";
import { useState } from "react";
import API from "../../services/api";

export default function CreateUser() {

  const [form, setForm] = useState({
    name:"",
    email:"",
    mobile:"",
    username:"",
    password:"",
    role:"",
    courses:"",
    profile_image:""
  });

  const [errors, setErrors] = useState({});

  const capitalize = (v) =>
    v.replace(/\b\w/g, c => c.toUpperCase());

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (["name","role","courses"].includes(name)) {
      value = capitalize(value);
    }

    if (name === "mobile") {
      value = value.replace(/\D/g, "").slice(0,10);
    }

    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    let err = {};

    if (!form.name) err.name="Required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) err.email="Invalid";
    if (!form.mobile.match(/^[0-9]{10}$/)) err.mobile="Invalid";
    if (!form.username) err.username="Required";
    if (form.password.length < 6) err.password="Weak password";
    if (!form.role) err.role="Required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const create = async () => {
    if (!validate()) {
      alert("Fix errors");
      return;
    }

    try {
      await API.post("/auth/create-user", form);
      alert("User Created");
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <Layout>

      <div className="profile-container">

        <div className="profile-right">

          <Input name="name" value={form.name} error={errors.name} onChange={handleChange} label="Name" />
          <Input name="email" value={form.email} error={errors.email} onChange={handleChange} label="Email" />
          <Input name="mobile" value={form.mobile} error={errors.mobile} onChange={handleChange} label="Mobile (+91)" />
          <Input name="username" value={form.username} error={errors.username} onChange={handleChange} label="Username" />
          <Input name="password" value={form.password} error={errors.password} onChange={handleChange} label="Password" />
          <Input name="role" value={form.role} error={errors.role} onChange={handleChange} label="Role" />
          <Input name="courses" value={form.courses} onChange={handleChange} label="Courses" />

          <button className="btn" onClick={create}>Create User</button>

        </div>

      </div>

    </Layout>
  );
}

function Input({ label, name, value, onChange, error }) {
  return (
    <div className="input-group">
      <label>{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className={error ? "error" : ""}
      />
      {error && <p style={{color:"red"}}>{error}</p>}
    </div>
  );
}