import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "projectNumbers";
const PARTNERS_KEY = "partners";

const generateId = () =>
  `proj_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

const loadPartners = () => {
  const stored = localStorage.getItem(PARTNERS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
};

export default function ProjectNumberForm() {
  const navigate = useNavigate();

  const [partners, setPartners] = useState(loadPartners);
  const [form, setForm] = useState({
    projectNo: "",
    partnerId: "",
    endUserId: "",
  });

  useEffect(() => {
    const handleStorageChange = () => setPartners(loadPartners());
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.projectNo.trim() || !form.partnerId || !form.endUserId) return;

    const newProject = {
      id: generateId(),
      projectNo: form.projectNo.trim(),
      partnerId: form.partnerId,
      endUserId: form.endUserId,
    };

    const stored = localStorage.getItem(STORAGE_KEY);
    const projects = stored ? JSON.parse(stored) : [];

    projects.push(newProject);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));

    navigate("/masters/project-numbers");
  };

  const inputClass =
    "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#017e84] focus:border-[#017e84] transition";

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
        
        {/* Header */}
        <div className="border-b px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800">
            Add Project Number
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* 3 Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* Project No */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Project No *
              </label>
              <input
                type="text"
                name="projectNo"
                value={form.projectNo}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Enter project number"
              />
            </div>

            {/* Partner */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Partner *
              </label>
              <select
                name="partnerId"
                value={form.partnerId}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* End User */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                End User *
              </label>
              <select
                name="endUserId"
                value={form.endUserId}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate("/masters/project-numbers")}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 text-sm bg-[#017e84] text-white rounded-md hover:bg-[#01656a] shadow-sm transition"
            >
              Save Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}