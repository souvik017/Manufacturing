import { useState } from "react";
import { toast } from "react-toastify";

import { baseClient } from "../services/api.clients";
import { APIEndpoints } from "../services/api.endpoints";

const useUomCategory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ==========================
     GET ALL UOM CATEGORIES
  ========================== */
  const getUomCategories = async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.post(APIEndpoints.getUomCategories, payload);

      if (response.data?.status === true) {
        return { success: true, data: response.data.data, pagination: response.data.pagination };
      }

      throw new Error(response.data?.message || "Failed to fetch UOM categories");
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || err.message || "Failed to fetch UOM categories";

      setError(errMsg);
      toast.error(errMsg);

      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* ==========================
     CREATE UOM CATEGORY
  ========================== */
  const createUomCategory = async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.post(APIEndpoints.createUomCategory, payload);

      if (response.data?.status === true) {
        toast.success(response.data.message || "UOM Category created");
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
     UPDATE UOM CATEGORY
  ========================== */
  const updateUomCategory = async (id, payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.post(APIEndpoints.updateUomCategory, { ...payload, id });

      if (response.data?.status === true) {
        toast.success(response.data.message || "UOM Category updated");
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
     DELETE UOM CATEGORY
  ========================== */
  const deleteUomCategory = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.post(APIEndpoints.deleteUomCategory, { id });

      if (response.data?.status === true) {
        toast.success(response.data.message || "UOM Category deleted");
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
    getUomCategories,
    createUomCategory,
    updateUomCategory,
    deleteUomCategory,
    loading,
    error,
  };
};

export default useUomCategory;