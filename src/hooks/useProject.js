import { useState } from "react";
import { toast } from "react-toastify";

import { baseClient } from "../services/api.clients";
import { APIEndpoints } from "../services/api.endpoints";

const useProject = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ==========================
     GET ALL PROJECTS
  ========================== */
  const getProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.get(APIEndpoints.getProjects);

      if (response.data?.status === true) {
        return { success: true, data: response.data.data };
      }

      throw new Error(response.data?.message || "Failed to fetch projects");
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || err.message || "Failed to fetch projects";

      setError(errMsg);
      toast.error(errMsg);

      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* ==========================
     CREATE PROJECT
  ========================== */
  const createProject = async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.post(APIEndpoints.createProject, payload);

      if (response.data?.status === true) {
        toast.success(response.data.message || "Project created");
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
     UPDATE PROJECT
  ========================== */
  const updateProject = async (id, payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.put(
        `${APIEndpoints.updateProject}/${id}`,
        payload
      );

      if (response.data?.status === true) {
        toast.success(response.data.message || "Project updated");
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
     DELETE PROJECT
  ========================== */
  const deleteProject = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.delete(
        `${APIEndpoints.deleteProject}/${id}`
      );

      if (response.data?.status === true) {
        toast.success(response.data.message || "Project deleted");
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
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    loading,
    error,
  };
};

export default useProject;