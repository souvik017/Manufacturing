import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useUomCategory from "../../hooks/useUomCategory";

export default function UomCategoryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createUomCategory, updateUomCategory, getUomCategories, loading } = useUomCategory();
  const [uomName, setUomName] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      const fetchSingle = async () => {
        const res = await getUomCategories({ page: 1, limit: 100 });
        if (res.success) {
          const found = res.data.find((item) => item.id === id);
          if (found) setUomName(found.uom_name);
        }
      };
      fetchSingle();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uomName.trim()) return;

    let result;
    if (isEditMode) {
      result = await updateUomCategory(id, { uom_name: uomName.trim() });
    } else {
      result = await createUomCategory({ uom_name: uomName.trim() });
    }

    if (result.success) {
      navigate("/masters/uomcategories");
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#017e84] focus:border-[#017e84] transition";

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800">
            {isEditMode ? "Edit UOM Category" : "Add UOM Category"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                UOM Name *
              </label>
              <input
                type="text"
                value={uomName}
                onChange={(e) => setUomName(e.target.value)}
                required
                placeholder="Enter UOM name"
                className={inputClass}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate("/masters/uomcategories")}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm bg-[#017e84] text-white rounded-md hover:bg-[#01656a] shadow-sm transition disabled:opacity-50"
            >
              {loading ? "Saving..." : (isEditMode ? "Update UOM" : "Save UOM")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}