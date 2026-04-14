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
  const getProducts = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await baseClient.post (APIEndpoints.getProducts , payload);
      if (response.data?.status === true) {
        return { success: true, data: response.data.data , pagination: response.data.pagination };
      }
      throw new Error(response.data?.message || "Failed to fetch products");
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || "Failed to fetch products";
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
  const getProductTypes = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await baseClient.post(APIEndpoints.getProductTypes , payload);
      if (response.data?.status === true) {
        return { success: true, data: response.data.data , pagination: response.data.pagination };
      }
      throw new Error(response.data?.message || "Failed to fetch product types");
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || "Failed to fetch product types";
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
  const getProductCategories = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await baseClient.post(APIEndpoints.getProductCategories , payload);
      if (response.data?.status === true) {
        return { success: true, data: response.data.data, pagination: response.data.pagination };
      }
      throw new Error(response.data?.message || "Failed to fetch categories");
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || "Failed to fetch categories";
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
      const response = await baseClient.post(APIEndpoints.createProduct, payload);
      if (response.data?.status === true) {
        toast.success(response.data.message || "Product created");
        return { success: true, data: response.data.data };
      }
      throw new Error(response.data?.message || "Create failed");
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || "Create failed";
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
      const response = await baseClient.put(APIEndpoints.updateProduct, { ...payload, id });
      if (response.data?.status === true) {
        toast.success(response.data.message || "Product updated");
        const data = response.data.data;
        return { success: true, data: Array.isArray(data) ? data : [data] };
      }
      throw new Error(response.data?.message || "Update failed");
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || "Update failed";
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
      const response = await baseClient.post(APIEndpoints.deleteProduct, { id });
      if (response.data?.status === true) {
        toast.success(response.data.message || "Product deleted");
        return { success: true };
      }
      throw new Error(response.data?.message || "Delete failed");
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || "Delete failed";
      setError(errMsg);
      toast.error(errMsg);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     CREATE PRODUCT CATEGORY
  ================================ */
  const createProductCategory = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await baseClient.post(APIEndpoints.createProductCategory, payload);
      if (response.data?.status === true) {
        toast.success(response.data.message || "Category created");
        return { success: true, data: response.data.data };
      }
      throw new Error(response.data?.message || "Create failed");
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || "Create failed";
      setError(errMsg);
      toast.error(errMsg);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     UPDATE PRODUCT CATEGORY
  ================================ */
  const updateProductCategory = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await baseClient.put(APIEndpoints.updateProductCategory, { ...payload, id });
      if (response.data?.status === true) {
        toast.success(response.data.message || "Category updated");
        return { success: true, data: response.data.data };
      }
      throw new Error(response.data?.message || "Update failed");
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || "Update failed";
      setError(errMsg);
      toast.error(errMsg);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     DELETE PRODUCT CATEGORY
  ================================ */
  const deleteProductCategory = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await baseClient.post(APIEndpoints.deleteProductCategory, { id });
      if (response.data?.status === true) {
        toast.success(response.data.message || "Category deleted");
        return { success: true };
      }
      throw new Error(response.data?.message || "Delete failed");
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || "Delete failed";
      setError(errMsg);
      toast.error(errMsg);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     CREATE PRODUCT TYPE
  ================================ */
  const createProductType = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await baseClient.post(APIEndpoints.createProductType, payload);
      if (response.data?.status === true) {
        toast.success(response.data.message || "Product type created");
        return { success: true, data: response.data.data };
      }
      throw new Error(response.data?.message || "Create failed");
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || "Create failed";
      setError(errMsg);
      toast.error(errMsg);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     UPDATE PRODUCT TYPE
  ================================ */
  const updateProductType = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await baseClient.post(APIEndpoints.updateProductType, { ...payload, id });
      if (response.data?.status === true) {
        toast.success(response.data.message || "Product type updated");
        return { success: true, data: response.data.data };
      }
      throw new Error(response.data?.message || "Update failed");
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || "Update failed";
      setError(errMsg);
      toast.error(errMsg);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     DELETE PRODUCT TYPE
  ================================ */
  const deleteProductType = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await baseClient.post(APIEndpoints.deleteProductType, { id });
      if (response.data?.status === true) {
        toast.success(response.data.message || "Product type deleted");
        return { success: true };
      }
      throw new Error(response.data?.message || "Delete failed");
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || "Delete failed";
      setError(errMsg);
      toast.error(errMsg);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    // Products
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    // Categories
    getProductCategories,
    createProductCategory,
    updateProductCategory,
    deleteProductCategory,
    // Types
    getProductTypes,
    createProductType,
    updateProductType,
    deleteProductType,
    // State
    loading,
    error,
  };
};

export default useProduct;