import { useState } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "partners";

const generateId = () =>
  `part_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

export default function PartnerForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    code: "",
    name: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) return;

    const newPartner = {
      id: generateId(),
      code: form.code.trim(),
      name: form.name.trim(),
    };

    const stored = localStorage.getItem(STORAGE_KEY);
    const partners = stored ? JSON.parse(stored) : [];

    partners.push(newPartner);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(partners));

    navigate("/masters/partners");
  };

  const inputClass =
    "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#017e84] focus:border-[#017e84] transition";

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
        
        {/* Header */}
        <div className="border-b px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800">
            Add Partner
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* Partner Code */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Partner Code *
              </label>
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                required
                placeholder="Enter partner code"
                className={inputClass}
              />
            </div>

            {/* Partner Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Partner Name *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Enter partner name"
                className={inputClass}
              />
            </div>

            {/* Empty slot (keeps 3-column balance, future-proof) */}
            <div className="hidden lg:block" />

          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate("/masters/partners")}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 text-sm bg-[#017e84] text-white rounded-md hover:bg-[#01656a] shadow-sm transition"
            >
              Save Partner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}