// pages/masters/PartnerForm.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import usePartner from "../../hooks/usePartner";

export default function PartnerForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // present on edit route: /masters/partners/edit/:id
  const isEdit = Boolean(id);

  const { getPartners, createPartner, updatePartner, loading } = usePartner();

  const [form, setForm] = useState({
    partner_code: "",
    partner_name: "",
  });

  // ── Prefill form when editing ──────────────────────────────────
  useEffect(() => {
    if (!isEdit) return;

    const fetchAndPrefill = async () => {
      const result = await getPartners();
      if (result.success) {
        const match = result.data.find((p) => String(p.id) === String(id));
        if (match) {
          setForm({
            partner_code: match.partner_code ?? "",
            partner_name: match.partner_name ?? "",
          });
        }
      }
    };

    fetchAndPrefill();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      partner_code: form.partner_code.trim(),
      partner_name: form.partner_name.trim(),
    };

    const result = isEdit
      ? await updatePartner(id, payload)
      : await createPartner(payload);

    if (result.success) {
      navigate("/masters/partners");
    }
  };

  // ── Styles ────────────────────────────────────────────────────
  const inputClass =
    "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#017e84] focus:border-[#017e84] transition disabled:bg-gray-50 disabled:text-gray-400";

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">

        {/* Header */}
        <div className="border-b px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800">
            {isEdit ? "Edit Partner" : "Add Partner"}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* Partner Code */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Partner Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="partner_code"
                value={form.partner_code}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Enter partner code"
                className={inputClass}
              />
            </div>

            {/* Partner Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Partner Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="partner_name"
                value={form.partner_name}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Enter partner name"
                className={inputClass}
              />
            </div>

            {/* Empty slot — keeps 3-column balance, future-proof */}
            <div className="hidden lg:block" />

          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate("/masters/partners")}
              disabled={loading}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm bg-[#017e84] text-white rounded-md hover:bg-[#01656a] shadow-sm disabled:opacity-50 transition"
            >
              {loading
                ? isEdit ? "Updating…" : "Saving…"
                : isEdit ? "Update Partner" : "Save Partner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}