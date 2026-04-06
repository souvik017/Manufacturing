// pages/ManufacturerForm.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import useManufacture from "../../hooks/useManufacture";

export default function ManufacturerForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { createManufacturer, updateManufacturer, getManufacturerById, loading } = useManufacture();
  const [manufacturerName, setManufacturerName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check if we're in edit mode
  const isEditMode = location.pathname.includes("/edit") || (id && id !== "add");
  const manufacturerId = isEditMode ? (id || location.state?.manufacturer?.id || location.state?.manufacturer?._id) : null;

  useEffect(() => {
    const loadManufacturerData = async () => {
      if (isEditMode) {
        // First try to get data from location state
        if (location.state?.manufacturer) {
          const manufacturer = location.state.manufacturer;
          setManufacturerName(manufacturer.manufacturer_name || manufacturer.name || "");
        } 
        // If no state, fetch from API
        else if (manufacturerId) {
          setIsLoading(true);
          const result = await getManufacturerById(manufacturerId);
          if (result.success && result.data) {
            setManufacturerName(result.data.manufacturer_name || result.data.name || "");
          } else {
            setError("Failed to load manufacturer data");
            setTimeout(() => navigate("/masters/manufacturers"), 2000);
          }
          setIsLoading(false);
        }
      }
    };

    loadManufacturerData();
  }, [isEditMode, location.state, manufacturerId, getManufacturerById, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedName = manufacturerName.trim();
    if (!trimmedName) {
      setError("Manufacturer name is required");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Manufacturer name must be at least 2 characters long");
      return;
    }

    setError("");
    
    let result;
    if (isEditMode) {
      result = await updateManufacturer(manufacturerId, {
        manufacturer_name: trimmedName
      });
    } else {
      result = await createManufacturer({
        manufacturer_name: trimmedName
      });
    }

    if (result.success) {
      navigate("/masters/manufacturers");
    } else {
      setError(result.error || `Failed to ${isEditMode ? "update" : "create"} manufacturer`);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#017e84] focus:border-[#017e84] transition disabled:bg-gray-100 disabled:cursor-not-allowed";

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex justify-center items-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#017e84] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading manufacturer data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
        
        {/* Header */}
        <div className="border-b px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800">
            {isEditMode ? "Edit Manufacturer" : "Add Manufacturer"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEditMode ? "Update manufacturer information" : "Create a new manufacturer"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5">
            {/* Manufacturer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manufacturer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={manufacturerName}
                onChange={(e) => {
                  setManufacturerName(e.target.value);
                  if (error) setError("");
                }}
                disabled={loading}
                required
                placeholder="Enter manufacturer name (e.g., ABC Pvt Ltd)"
                className={inputClass}
                autoFocus
              />
              <p className="mt-1 text-xs text-gray-500">
                Example: Siemens, ABB, Bosch, Schneider Electric, etc.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate("/masters/manufacturers")}
              disabled={loading}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm bg-[#017e84] text-white rounded-md hover:bg-[#01656a] shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{isEditMode ? "Updating..." : "Saving..."}</span>
                </>
              ) : (
                <span>{isEditMode ? "Update Manufacturer" : "Save Manufacturer"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}