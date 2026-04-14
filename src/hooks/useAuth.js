// hooks/useAuth.js
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

import { baseClient } from "../services/api.clients";
import { APIEndpoints } from "../services/api.endpoints";
import { login, logout } from "../redux/Slices/authSlice";

const useAuth = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ==========================
     LOGIN
  ========================== */
  const loginUser = async ({ username, password }) => {
    setLoading(true);
    setError(null);

    try {
      // API expects 'user_login_id', not 'username'
      const response = await baseClient.post(APIEndpoints.logIn, {
        user_login_id: username,
        password,
      });

      if (response.data?.status === true) {
        const { token, ...userData } = response.data.data;

        // Store token and user in localStorage
        localStorage.setItem("authToken", token);
        localStorage.setItem("authMember", JSON.stringify(userData));

        dispatch(
          login({
            token,
            member: userData,
          })
        );

        toast.success(response.data.message || "Login successful");
        return { success: true };
      }

      throw new Error(response.data?.message || "Login failed");
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err.message ||
        "Login failed";

      setError(errMsg);
      toast.error(errMsg);

      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* ==========================
     LOGOUT
  ========================== */
  const logoutUser = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authMember");
    dispatch(logout());
    toast.success("Logged out successfully");
  };

  /* ==========================
     CHECK AUTH (on app load)
  ========================== */
  const checkAuth = () => {
    const token = localStorage.getItem("authToken");
    const member = localStorage.getItem("authMember");

    if (token && member) {
      try {
        const parsedMember = JSON.parse(member);
        dispatch(login({ token, member: parsedMember }));
        return true;
      } catch (e) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authMember");
        return false;
      }
    }
    return false;
  };

  /* ==========================
     GET CURRENT USER
  ========================== */
  const getCurrentUser = async () => {
    try {
      const response = await baseClient.get(APIEndpoints.currentUser);
      if (response.data?.status === true) {
        const userData = response.data.data;
        localStorage.setItem("authMember", JSON.stringify(userData));
        dispatch(
          login({
            token: localStorage.getItem("authToken"),
            member: userData,
          })
        );
        return { success: true, user: userData };
      }
      return { success: false };
    } catch (err) {
      return { success: false };
    }
  };

  // Auto‑check auth on hook mount
  useEffect(() => {
    checkAuth();
  }, []);

  return {
    loginUser,
    logoutUser,
    checkAuth,
    getCurrentUser,
    loading,
    error,
  };
};

export default useAuth;