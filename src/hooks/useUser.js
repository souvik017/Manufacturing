// hooks/useUser.js
import { useState } from "react";
import { toast } from "react-toastify";
import { baseClient } from "../services/api.clients";
import { APIEndpoints } from "../services/api.endpoints";

const useUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ==========================
     GET ALL USERS
  ========================== */
  const getUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await baseClient.get(APIEndpoints.users);
      if (response.data?.status === true) {
        return { success: true, data: response.data.data };
      }
      throw new Error(response.data?.message || "Failed to fetch users");
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || "Failed to fetch users";
      setError(errMsg);
      toast.error(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  /* ==========================
     GET USER BY ID
  ========================== */
  const getUserById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await baseClient.get(`${APIEndpoints.users}/${id}`);
      if (response.data?.status === true) {
        return { success: true, data: response.data.data };
      }
      throw new Error(response.data?.message || "User not found");
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || "Failed to fetch user";
      setError(errMsg);
      toast.error(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  /* ==========================
     CREATE USER
  ========================== */
  const createUser = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await baseClient.post(APIEndpoints.users, userData);
      if (response.data?.status === true) {
        toast.success(response.data.message || "User created successfully");
        return { success: true, data: response.data.data };
      }
      throw new Error(response.data?.message || "Failed to create user");
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || "Failed to create user";
      setError(errMsg);
      toast.error(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  /* ==========================
     UPDATE USER
  ========================== */
  const updateUser = async (id, userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await baseClient.put(`${APIEndpoints.users}/${id}`, userData);
      if (response.data?.status === true) {
        toast.success(response.data.message || "User updated successfully");
        return { success: true, data: response.data.data };
      }
      throw new Error(response.data?.message || "Failed to update user");
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || "Failed to update user";
      setError(errMsg);
      toast.error(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  /* ==========================
     DELETE USER
  ========================== */
  const deleteUser = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await baseClient.delete(`${APIEndpoints.users}/${id}`);
      if (response.data?.status === true) {
        toast.success(response.data.message || "User deleted successfully");
        return { success: true };
      }
      throw new Error(response.data?.message || "Failed to delete user");
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || "Failed to delete user";
      setError(errMsg);
      toast.error(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  /* ==========================
     UPDATE PASSWORD
  ========================== */
  const updatePassword = async (id, passwordData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await baseClient.put(`${APIEndpoints.users}/${id}/password`, passwordData);
      if (response.data?.status === true) {
        toast.success(response.data.message || "Password updated successfully");
        return { success: true };
      }
      throw new Error(response.data?.message || "Failed to update password");
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || "Failed to update password";
      setError(errMsg);
      toast.error(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    updatePassword,
    loading,
    error,
  };
};

export default useUser;