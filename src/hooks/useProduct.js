// hooks/useProduct.js
import { useState } from "react";
import { toast } from "react-toastify";

import { baseClient } from "../services/api.clients";
import { APIEndpoints } from "../services/api.endpoints";

const useProduct = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ==========================
     GET ALL PRODUCTS
  ========================== */
  const getProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.get(APIEndpoints.getProducts);

      if (response.data?.status === true) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      throw new Error(response.data?.message || "Failed to fetch products");
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to fetch products";

      setError(errMsg);
      toast.error(errMsg);

      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* ==========================
     GET PRODUCT TYPES
  ========================== */
  const getProductTypes = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.get(APIEndpoints.getProductTypes);

      if (response.data?.status === true) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      throw new Error(response.data?.message || "Failed to fetch product types");
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to fetch product types";

      setError(errMsg);
      toast.error(errMsg);

      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* ==========================
     GET PRODUCT CATEGORIES
  ========================== */
  const getProductCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.get(APIEndpoints.getProductCategories);

      if (response.data?.status === true) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      throw new Error(response.data?.message || "Failed to fetch categories");
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to fetch categories";

      setError(errMsg);
      toast.error(errMsg);

      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* ==========================
     CREATE PRODUCT
  ========================== */
  const createProduct = async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.post(
        APIEndpoints.createProduct,
        payload
      );

      if (response.data?.status === true) {
        toast.success(response.data.message || "Product created");
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
     UPDATE PRODUCT
  ========================== */
const updateProduct = async (id, payload) => {
  setLoading(true);
  setError(null);

  try {
    const response = await baseClient.put(
      APIEndpoints.updateProduct, 
      {
        ...payload,
        id, // ✅ include id in body
      }
    );

    if (response.data?.status === true) {
      toast.success(response.data.message || "Product updated");

      const data = response.data.data;

      return {
        success: true,
        data: Array.isArray(data) ? data : [data], // optional normalization
      };
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
     DELETE PRODUCT
  ========================== */
const deleteProduct = async (id) => {
  setLoading(true);
  setError(null);

  try {
    const response = await baseClient.post(
      APIEndpoints.deleteProduct,
      {
       id , // ✅ send in body
      }
    );

    if (response.data?.status === true) {
      toast.success(response.data.message || "Product deleted");
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
    getProducts,
    getProductTypes,
    getProductCategories,
    createProduct,
    updateProduct,
    deleteProduct,
    loading,
    error,
  };
};

export default useProduct;