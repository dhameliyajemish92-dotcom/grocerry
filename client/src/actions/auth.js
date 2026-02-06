import axios from "axios"

export const authLogin = (email, password, onSuccess, onError) => async () => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/me/login`,
      { email, password }
    )

    localStorage.setItem("profile", JSON.stringify({
      token: res.data.token,
      user: res.data.user
    }))

    onSuccess(res.data)

  } catch (err) {
    onError(err.response?.data || { message: "Login failed" })
  }
}

export const logout = () => () => {
  localStorage.removeItem("profile")
  window.location.href = "/login"
}
