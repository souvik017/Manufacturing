// hooks/useAuth.js
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

import { baseClient } from "../../../services/api.clients";
import { APIEndpoints } from "../../../services/api.endpoints";
import { login, logout } from "../redux/authSlice";

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
      const response = await baseClient.post(
        APIEndpoints.logIn,
        { username, password }
      );

      if (response.data?.status === true) {
        const { token, ...userData } = response.data.data;

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
    dispatch(logout());
    toast.success("Logged out successfully");
  };

  return {
    loginUser,
    logoutUser,
    loading,
    error,
  };
};

export default useAuth;