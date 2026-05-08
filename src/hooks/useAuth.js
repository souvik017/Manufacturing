// hooks/useAuth.js
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

import { baseClient } from "../services/api.clients";
import { APIEndpoints } from "../services/api.endpoints";
import { login, logout } from "../redux/Slices/authSlice";

const useAuth = () => {
  const dispatch = useDispatch();

  // Loading / error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [updateUserStatusLoading, setUpdateUserStatusLoading] = useState(false);
  const [updateUserLoading, setUpdateUserLoading] = useState(false);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);
  const [fetchUsersLoading, setFetchUsersLoading] = useState(false);

  /* ==============================
     LOGIN (POST)
  ============================== */
  const loginUser = async ({ username, password }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await baseClient.post(APIEndpoints.logIn, {
        user_login_id: username,
        password,
      });
      if (response.data?.status === true) {
        const { token, ...userData } = response.data.data;
        localStorage.setItem("authToken", token);
        localStorage.setItem("authMember", JSON.stringify(userData));
        dispatch(login({ token, member: userData }));
        toast.success(response.data.message || "Login successful");
        return { success: true };
      }
      throw new Error(response.data?.message || "Login failed");
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || "Login failed";
      setError(errMsg);
      toast.error(errMsg);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* ==============================
     LOGOUT (POST – optional server call)
  ============================== */
  const logoutUser = async () => {
    try {
      if (APIEndpoints.logOut) {
        await baseClient.post(APIEndpoints.logOut, {});
      }
    } catch (err) {
      // Ignore server errors on logout
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authMember");
      dispatch(logout());
      toast.success("Logged out successfully");
    }
  };

  /* ==============================
     CHECK AUTH (from localStorage)
  ============================== */
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

  /* ==============================
     GET CURRENT USER (POST)
  ============================== */
  const getCurrentUser = async () => {
    try {
      const response = await baseClient.post(APIEndpoints.currentUser, {});
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

 // hooks/useAuth.js (partial – replace the existing resetPassword function)

/* ==============================
   RESET PASSWORD (POST)
   Body: { id, old_password, new_password }
   Used by users to change their own password
============================== */
const resetPassword = async ({ id, old_password, new_password }) => {
  setResetPasswordLoading(true);
  try {
    const response = await baseClient.post(APIEndpoints.resetPassword, {
      user_id : id,
      id,
      old_password,
      new_password,
    });
    if (response.data?.status === true) {
      toast.success(response.data.message || "Password changed successfully");
      return { success: true };
    }
    throw new Error(response.data?.message || "Password change failed");
  } catch (err) {
    const errMsg = err?.response?.data?.message || err.message;
    toast.error(errMsg);
    return { success: false };
  } finally {
    setResetPasswordLoading(false);
  }
};

  /* ==============================
     ADD USER (POST)
     Body: { emp_id, user_login_id, password, name, user_type }
  ============================== */
  const addUser = async ({ emp_id, user_login_id, password, name, user_type }) => {
    setAddUserLoading(true);
    try {
      const response = await baseClient.post(APIEndpoints.addUser, {
        emp_id,
        user_login_id,
        password,
        name,
        user_type,
      });
      if (response.data?.status === true) {
        toast.success(response.data.message || "User added successfully");
        return { success: true, data: response.data.data };
      }
      throw new Error(response.data?.message || "Add user failed");
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message;
      toast.error(errMsg);
      return { success: false };
    } finally {
      setAddUserLoading(false);
    }
  };

  /* ==============================
     UPDATE USER STATUS (POST)
     Body: { user_id, status }
  ============================== */
  const updateUserStatus = async ({ user_id, status }) => {
    setUpdateUserStatusLoading(true);
    try {
      const response = await baseClient.post(APIEndpoints.updateUserStatus, {
        user_id,
        status,
      });
      if (response.data?.status === true) {
        toast.success(response.data.message || "User status updated");
        return { success: true };
      }
      throw new Error(response.data?.message || "Update status failed");
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message;
      toast.error(errMsg);
      return { success: false };
    } finally {
      setUpdateUserStatusLoading(false);
    }
  };

  /* ==============================
     UPDATE USER (POST)
     Body: { user_id, user_login_id, name, password, status }
  ============================== */
  const updateUser = async ({ user_id, user_login_id, name, password, status }) => {
    setUpdateUserLoading(true);
    try {
      const response = await baseClient.post(APIEndpoints.updateUser, {
        user_id,
        user_login_id,
        name,
        password,
        status,
      });
      if (response.data?.status === true) {
        toast.success(response.data.message || "User updated");
        // Refresh current user if the updated user is the logged-in user
        const current = localStorage.getItem("authMember");
        if (current) {
          const parsed = JSON.parse(current);
          if (parsed.user_id === user_id) await getCurrentUser();
        }
        return { success: true, data: response.data.data };
      }
      throw new Error(response.data?.message || "Update user failed");
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message;
      toast.error(errMsg);
      return { success: false };
    } finally {
      setUpdateUserLoading(false);
    }
  };

  /* ==============================
     DELETE USER (POST)
     Body: { user_id }
  ============================== */
  const deleteUser = async ({ user_id }) => {
    setDeleteUserLoading(true);
    try {
      const response = await baseClient.post(APIEndpoints.deleteUser, { user_id });
      if (response.data?.status === true) {
        toast.success(response.data.message || "User deleted");
        // If the deleted user is the current logged-in user, log out
        const current = localStorage.getItem("authMember");
        if (current) {
          const parsed = JSON.parse(current);
          if (parsed.user_id === user_id) await logoutUser();
        }
        return { success: true };
      }
      throw new Error(response.data?.message || "Delete user failed");
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message;
      toast.error(errMsg);
      return { success: false };
    } finally {
      setDeleteUserLoading(false);
    }
  };

  /* ==============================
     FETCH ALL USERS (POST)
     Body: {} (empty object)
  ============================== */
  const fetchUsers = async () => {
    setFetchUsersLoading(true);
    try {
      const response = await baseClient.post(APIEndpoints.getUsers, {});
      if (response.data?.status === true) {
        return { success: true, users: response.data.data.users };
      }
      throw new Error(response.data?.message || "Failed to fetch users");
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message;
      toast.error(errMsg);
      return { success: false, users: [] };
    } finally {
      setFetchUsersLoading(false);
    }
  };

  // Auto‑check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  return {
    // Auth
    loginUser,
    logoutUser,
    checkAuth,
    getCurrentUser,
    loading,
    error,

    // User management
    resetPassword,
    resetPasswordLoading,
    addUser,
    addUserLoading,
    updateUserStatus,
    updateUserStatusLoading,
    updateUser,
    updateUserLoading,
    deleteUser,
    deleteUserLoading,
    fetchUsers,
    fetchUsersLoading,
  };
};

export default useAuth;