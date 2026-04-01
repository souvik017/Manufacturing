import { useState } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "uomCategories";

const generateId = () =>
  `uom_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

export default function UomCategoryForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newUom = { id: generateId(), name: name.trim() };

    const stored = localStorage.getItem(STORAGE_KEY);
    const uoms = stored ? JSON.parse(stored) : [];

    uoms.push(newUom);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(uoms));

    navigate("/masters/uom-categories");
  };

  const inputClass =
    "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#017e84] focus:border-[#017e84] transition";

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
        
        {/* Header */}
        <div className="border-b px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800">
            Add UOM Category
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Grid (future-proof layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* UOM Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                UOM Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter UOM name"
                className={inputClass}
              />
            </div>

          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate("/masters/uom-categories")}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 text-sm bg-[#017e84] text-white rounded-md hover:bg-[#01656a] shadow-sm transition"
            >
              Save UOM
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}