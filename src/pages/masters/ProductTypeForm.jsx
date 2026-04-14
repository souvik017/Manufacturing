import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import useProduct from "../../hooks/useProduct";

export default function ProductTypeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { getProductTypes, createProductType, updateProductType, loading } = useProduct();

  const [name, setName] = useState("");
  const [fetching, setFetching] = useState(isEdit);

  // ── Pre-fill on edit ─────────────────────────────────────────
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setFetching(true);
      const result = await getProductTypes();
      console.log("getProductTypes result:", result); // Debug: see structure
      if (result.success) {
        // Normalize data array (might be result.data or result.data.data)
        let dataArray = result.data;
        if (!Array.isArray(dataArray) && dataArray?.data) dataArray = dataArray.data;
        const type = dataArray?.find((t) => String(t.id) === String(id));
        if (type) {
          // Determine the name field dynamically
          const nameValue = type.item_type_name || type.type_name || type.name || "";
          setName(nameValue);
        } else {
          navigate("/masters/producttype");
        }
      } else {
        navigate("/masters/producttype");
      }
      setFetching(false);
    })();
  }, [id]);

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = { item_type_name: name.trim(), status: 1 };
    let result;

    if (isEdit) {
      result = await updateProductType(id, payload);
    } else {
      result = await createProductType(payload);
    }

    if (result.success) {
      navigate("/masters/producttype");
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#017e84] focus:border-[#017e84] transition disabled:bg-gray-100 disabled:cursor-not-allowed";

  if (fetching) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b px-6 py-4">
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
          </div>
          <div className="p-6 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800">
            {isEdit ? "Edit Product Type" : "Add Product Type"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Type Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className={inputClass}
                placeholder="Enter product type name"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate("/masters/producttype")}
              disabled={loading}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-5 py-2 text-sm bg-[#017e84] text-white rounded-md hover:bg-[#01656a] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Update Type" : "Save Type"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}