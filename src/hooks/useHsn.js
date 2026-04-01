// hooks/useHsn.js
import { useState } from "react";
import { toast } from "react-toastify";

import { baseClient } from "../services/api.clients";
import { APIEndpoints } from "../services/api.endpoints";

const useHsn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ==========================
     GET ALL HSN
  ========================== */
  const getHsns = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.get(APIEndpoints.getHsns);

      if (response.data?.status === true) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      throw new Error(response.data?.message || "Failed to fetch HSN");
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to fetch HSN";

      setError(errMsg);
      toast.error(errMsg);

      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* ==========================
     CREATE HSN
  ========================== */
  const createHsn = async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.post(
        APIEndpoints.createHsn,
        payload
      );

      if (response.data?.status === true) {
        toast.success(response.data.message || "HSN created");
        return { success: true, data: response.data.data };
      }

      throw new Error(response.data?.message || "Create failed");
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err.message ||
        "Create failed";

      setError(errMsg);
      toast.error(errMsg);

      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* ==========================
     UPDATE HSN
  ========================== */
  const updateHsn = async (id, payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.put(
        `${APIEndpoints.updateHsn}/${id}`,
        payload
      );

      if (response.data?.status === true) {
        toast.success(response.data.message || "HSN updated");
        return { success: true, data: response.data.data };
      }

      throw new Error(response.data?.message || "Update failed");
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err.message ||
        "Update failed";

      setError(errMsg);
      toast.error(errMsg);

      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* ==========================
     DELETE HSN
  ========================== */
  const deleteHsn = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.delete(
        `${APIEndpoints.deleteHsn}/${id}`
      );

      if (response.data?.status === true) {
        toast.success(response.data.message || "HSN deleted");
        return { success: true };
      }

      throw new Error(response.data?.message || "Delete failed");
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err.message ||
        "Delete failed";

      setError(errMsg);
      toast.error(errMsg);

      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    getHsns,
    createHsn,
    updateHsn,
    deleteHsn,
    loading,
    error,
  };
};

export default useHsn;