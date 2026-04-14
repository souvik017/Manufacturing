// components/PublicRoute.jsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    // User already logged in, redirect to default page
    return <Navigate to="/requisitions/add" replace />;
  }

  return children;
}