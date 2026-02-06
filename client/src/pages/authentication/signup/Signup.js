import styles from "../form.module.css";
import Authentication from "../Authentication";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Signup = () => {

  const navigate = useNavigate();

  const [showOTP, setShowOTP] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    otp: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API}/me/signup`, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password
      });

      alert("OTP sent to your email 📧");
      setShowOTP(true);

    } catch (err) {
      alert(JSON.stringify(err.response?.data || err.message))
    }
  };

  const verifyOTP = async () => {
    try {
      await axios.post(`${API}/me/verify-otp`, {
        email: formData.email,
        otp: formData.otp
      });

      alert("Account verified successfully ✅");
      navigate("/login");

    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <Authentication data={
      <div className={styles.wrapper}>

        <div className={styles.header}>
          <div className={styles.title}>Create Account</div>
          <div className={styles.login}>
            Already have account? <Link to="/login">Login</Link>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input name="first_name" placeholder="First Name" onChange={handleChange} required />
          <input name="last_name" placeholder="Last Name" onChange={handleChange} />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          <button className="btn1">Sign Up</button>
        </form>

        {showOTP && (
          <>
            <input
              name="otp"
              placeholder="Enter OTP"
              onChange={handleChange}
              className={styles.otp}
            />
            <button onClick={verifyOTP}>Verify OTP</button>
          </>
        )}

      </div>
    }/>
  );
};

export default Signup;
