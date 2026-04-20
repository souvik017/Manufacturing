// hooks/useManufacture.js
import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { baseClient } from "../services/api.clients";
import { APIEndpoints } from "../services/api.endpoints";

/**
 * Custom hook for Manufacturer CRUD operations
 * @returns {Object} Manufacturer operations and state
 */
const useManufacture = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manufacturers, setManufacturers] = useState([]);

  /**
   * Centralized error handler
   */
  const handleError = (err, defaultMsg) => {
    const errMsg = err?.response?.data?.message || err.message || defaultMsg;
    setError(errMsg);
    toast.error(errMsg);
    return errMsg;
  };

  /* ==========================
     GET ALL MANUFACTURERS
  ========================== */
  const getManufacturers = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.post(APIEndpoints.getManufactures, payload);

      if (response.data?.status === true) {
        const data = response.data.data;
        const pagination = response.data.pagination;
        setManufacturers(data);
        return { success: true, data: data };
      }

      throw new Error(response.data?.message || "Failed to fetch manufacturers");
    } catch (err) {
      const errMsg = handleError(err, "Failed to fetch manufacturers");
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  /* ==========================
     GET SINGLE MANUFACTURER
  ========================== */
  const getManufacturerById = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.get(`${APIEndpoints.getManufacture}/${id}`);

      if (response.data?.status === true) {
        return { success: true, data: response.data.data };
      }

      throw new Error(response.data?.message || "Manufacturer not found");
    } catch (err) {
      const errMsg = handleError(err, "Failed to fetch manufacturer");
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  /* ==========================
     CREATE MANUFACTURER
  ========================== */
  const createManufacturer = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.post(APIEndpoints.createManufacture, payload);

      if (response.data?.status === true) {
        toast.success(response.data.message || "Manufacturer created successfully");
        
        if (response.data.data) {
          setManufacturers(prev => [...prev, response.data.data]);
        }
        
        return { success: true, data: response.data.data };
      }

      throw new Error(response.data?.message || "Create failed");
    } catch (err) {
      const errMsg = handleError(err, "Create failed");
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  /* ==========================
     UPDATE MANUFACTURER
  ========================== */
  const updateManufacturer = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.put(APIEndpoints.updateManufacture, {
        id: Number(id),
        ...payload
      });

      if (response.data?.status === true) {
        toast.success(response.data.message || "Manufacturer updated successfully");
        
        if (response.data.data) {
          setManufacturers(prev => prev.map(item => 
            (item.id === id || item._id === id) ? response.data.data : item
          ));
        }
        
        return { success: true, data: response.data.data };
      }

      throw new Error(response.data?.message || "Update failed");
    } catch (err) {
      const errMsg = handleError(err, "Update failed");
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  /* ==========================
     DELETE MANUFACTURER
  ========================== */
  const deleteManufacturer = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.post(APIEndpoints.deleteManufacture, {
        id: Number(id)
      });

      if (response.data?.status === true) {
        toast.success(response.data.message || "Manufacturer deleted successfully");
        
        // Update local state
        setManufacturers(prev => prev.filter(item => item.id !== id && item._id !== id));
        
        return { success: true };
      }

      throw new Error(response.data?.message || "Delete failed");
    } catch (err) {
      const errMsg = handleError(err, "Delete failed");
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    loading,
    error,
    manufacturers,
    
    // CRUD Operations
    getManufacturers,
    getManufacturerById,
    createManufacturer,
    updateManufacturer,
    deleteManufacturer,
  };
};

export default useManufacture;