// pages/masters/HsnForm.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import useHsn from "../../hooks/useHsn";

export default function HsnForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { getHsns, createHsn, updateHsn, loading } = useHsn();

  const [hsnCode, setHsnCode] = useState("");
  const [fetching, setFetching] = useState(isEdit);

  // ── Pre-fill on edit ─────────────────────────────────────────
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setFetching(true);
      const result = await getHsns();
      if (result.success) {
        const found = result.data.find((h) => String(h.id) === String(id));
        if (found) {
          setHsnCode(found.hsn_code);
        } else {
          navigate("/masters/hsn");
        }
      }
      setFetching(false);
    })();
  }, [id]);

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = hsnCode.trim();
    if (!trimmed) return;

    // payload matches API: { "hsn_code": "1234" }
    const payload = { hsn_code: trimmed  , status : 1};
    const result = isEdit
      ? await updateHsn(id, payload)
      : await createHsn(payload);

    if (result.success) {
      navigate("/masters/hsnlist");
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono tracking-wide focus:outline-none focus:ring-2 focus:ring-[#017e84] focus:border-[#017e84] transition disabled:bg-gray-100 disabled:cursor-not-allowed";

  // ── Skeleton while loading existing record ───────────────────
  if (fetching) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b px-6 py-4">
            <div className="h-6 bg-gray-200 rounded w-40 animate-pulse" />
          </div>
          <div className="p-6 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
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
            {isEdit ? "Edit HSN Code" : "Add HSN Code"}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {isEdit
              ? "Update the HSN code details below."
              : "Enter the HSN code to add it to the master list."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* HSN Code */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                HSN Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={hsnCode}
                onChange={(e) => setHsnCode(e.target.value)}
                required
                disabled={loading}
                className={inputClass}
                placeholder="e.g. 85444990"
                maxLength={20}
              />
              <p className="mt-1.5 text-xs text-gray-400">
                Enter the numeric HSN (Harmonized System of Nomenclature) code.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate("/masters/hsn")}
              disabled={loading}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !hsnCode.trim()}
              className="px-5 py-2 text-sm bg-[#017e84] text-white rounded-md hover:bg-[#01656a] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Update HSN" : "Save HSN"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}