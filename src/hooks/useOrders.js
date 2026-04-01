import { useState } from "react";
import { toast } from "react-toastify";
import { baseClient } from "../services/api.clients";
import { APIEndpoints } from "../services/api.endpoints";

const useOrder = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ==========================
     GET ALL ORDERS
  ========================== */
  const getOrders = async ({ page = 1, limit = 10, requisition_no = "" } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await baseClient.get(APIEndpoints.getOrders, {
        data: { page, limit, requisition_no },
      });

      if (response.data?.status === true) {
        return {
          success: true,
          data: response.data,  // pass full response — caller digs into data.data
        };
      }
      throw new Error(response.data?.message || "Failed to fetch orders");
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || "Failed to fetch orders";
      setError(errMsg);
      toast.error(errMsg);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* ==========================
     GET SINGLE ORDER BY ID
  ========================== */
  const getOrderById = async (requisition_id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await baseClient.post(APIEndpoints.getOrderById, 
      {requisition_id : requisition_id}
      );

      if (response.data?.status === true) {
        return { success: true, data: response.data.data };
      }
      throw new Error(response.data?.message || "Failed to fetch order");
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || "Failed to fetch order";
      setError(errMsg);
      toast.error(errMsg);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* ==========================
     CREATE ORDER
  ========================== */
  const createOrder = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await baseClient.post(APIEndpoints.createOrder, payload);
      if (response.data?.status === true) {
        toast.success(response.data.message || "Order created");
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
     UPDATE ORDER
  ========================== */
  const updateOrder = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await baseClient.put(
        `${APIEndpoints.updateOrder}/${id}`,
        payload
      );
      if (response.data?.status === true) {
        toast.success(response.data.message || "Order updated");
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

  /* ==========================
     DELETE ORDER
  ========================== */
  const deleteOrder = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await baseClient.delete(
        `${APIEndpoints.deleteOrder}/${id}`
      );
      if (response.data?.status === true) {
        toast.success(response.data.message || "Order deleted");
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

  return { getOrders, getOrderById, createOrder, updateOrder, deleteOrder, loading, error };
};

export default useOrder;