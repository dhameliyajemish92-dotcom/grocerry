import styles from '../form.module.css'
import { Link, useNavigate } from "react-router-dom"
import Authentication from "../Authentication"
import { useState } from "react"
import axios from "axios"

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Login = () => {

  const navigate = useNavigate()

  const [data, setData] = useState({
    email: "",
    password: ""
  })

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value })
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      const res = await axios.post(`${API}/me/login`, data)

      // ✅ Save JWT token
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))

      navigate("/products")

    } catch (err) {
      alert(err.response?.data?.message || "Login failed")
    }
  }

  return (
    <Authentication data={
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div className={styles.title}>Login</div>
          <div className={styles.login}>
            New user? <Link to="/signup">Sign Up</Link>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleLogin}>
          <input name="email" placeholder="Email" onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
          <button className="btn1">Login</button>
        </form>
      </div>
    }/>
  )
}

export default Login
