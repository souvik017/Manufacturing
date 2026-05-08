// components/AdminRoute.jsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const { member } = useSelector((state) => state.auth);
  const userType = member?.user_type;

  // If not logged in or not admin, redirect to home (requisitions add)
  if (!member || userType !== 1) {
    return <Navigate to="/requisitions/add" replace />;
  }

  return children;
}