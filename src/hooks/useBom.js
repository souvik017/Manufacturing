// hooks/useBom.js
import { useState } from "react";
import { toast } from "react-toastify";

import { baseClient } from "../services/api.clients";
import { APIEndpoints } from "../services/api.endpoints";

const useBom = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ==========================
     GET ALL BOM
  ========================== */
  const getBoms = async (payload ,bom_name = "") => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.get(APIEndpoints.getBoms, {
        data: { bom_name },
        ...payload
      });

      if (response.data?.status === true) {
        return {
          success: true,
          data: response.data.data,
          pagination: response.data.pagination
        };
      }

      throw new Error(response.data?.message || "Failed to fetch BOM");
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to fetch BOM";

      setError(errMsg);
      toast.error(errMsg);

      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* ==========================
     CREATE BOM
  ========================== */
const createBom = async (payload) => {
  setLoading(true);
  setError(null);

  try {
    const finalPayload = {
      ...payload,
      product_id: payload.product_id || "1", // 👈 manually set here
    };

    const response = await baseClient.post(
      APIEndpoints.createBom,
      finalPayload
    );

    if (response.data?.status === true) {
      toast.success(response.data.message || "BOM created");
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
     UPDATE BOM
  ========================== */
  const updateBom = async (id, payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.post(
        APIEndpoints.updateBom,
      {...payload , bom_id : id , product_id:1}
      );

      if (response.data?.status === true) {
        toast.success(response.data.message || "BOM updated");
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
     DELETE BOM
  ========================== */
  const deleteBom = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.post(
        APIEndpoints.deleteBom , {bom_id:id}
      );

      if (response.data?.status === true) {
        toast.success(response.data.message || "BOM deleted");
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
    getBoms,
    createBom,
    updateBom,
    deleteBom,
    loading,
    error,
  };
};

export default useBom;