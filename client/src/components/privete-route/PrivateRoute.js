import { Navigate } from "react-router-dom";

const PrivateRoute = ({ component }) => {
  const profile = JSON.parse(localStorage.getItem("profile"));
  return profile?.token ? component : <Navigate to="/login" />;
};

export default PrivateRoute;
