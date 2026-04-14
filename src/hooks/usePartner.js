import { useState } from "react";
import { toast } from "react-toastify";

import { baseClient } from "../services/api.clients";
import { APIEndpoints } from "../services/api.endpoints";

const usePartner = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ==========================
     GET ALL PARTNERS
  ========================== */
  const getPartners = async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.post(APIEndpoints.getPartners, payload);

      if (response.data?.status === true) {
        return { success: true, data: response.data.data, pagination: response.data.pagination };
      }

      throw new Error(response.data?.message || "Failed to fetch partners");
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || err.message || "Failed to fetch partners";

      setError(errMsg);
      toast.error(errMsg);

      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* ==========================
     CREATE PARTNER
  ========================== */
  const createPartner = async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.post(APIEndpoints.createPartner, payload);

      if (response.data?.status === true) {
        toast.success(response.data.message || "Partner created");
        return { success: true, data: response.data.data };
      }

      throw new Error(response.data?.message || "Create failed");
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || err.message || "Create failed";

      setError(errMsg);
      toast.error(errMsg);

      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* ==========================
     UPDATE PARTNER
  ========================== */
  const updatePartner = async (id, payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.post(
        APIEndpoints.updatePartner ,
        { ...payload , id }
      );

      if (response.data?.status === true) {
        toast.success(response.data.message || "Partner updated");
        return { success: true, data: response.data.data };
      }

      throw new Error(response.data?.message || "Update failed");
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || err.message || "Update failed";

      setError(errMsg);
      toast.error(errMsg);

      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* ==========================
     DELETE PARTNER
  ========================== */
  const deletePartner = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.post(
        APIEndpoints.deletePartner ,
        { id }
      );

      if (response.data?.status === true) {
        toast.success(response.data.message || "Partner deleted");
        return { success: true };
      }

      throw new Error(response.data?.message || "Delete failed");
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || err.message || "Delete failed";

      setError(errMsg);
      toast.error(errMsg);

      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    getPartners,
    createPartner,
    updatePartner,
    deletePartner,
    loading,
    error,
  };
};

export default usePartner;