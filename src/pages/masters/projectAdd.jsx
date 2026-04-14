// pages/masters/ProjectNumberForm.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown, Search, X } from "lucide-react";
import useProject from "../../hooks/useProject";
import usePartner from "../../hooks/usePartner";

// ── Searchable Dropdown ────────────────────────────────────────
function SearchableSelect({ options = [], value, onChange, placeholder = "Select", disabled }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value));

  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    if (disabled) return;
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSelect = (option) => {
    onChange(option.value);
    setOpen(false);
    setQuery("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={`w-full border rounded-md px-3 py-2 text-sm text-left flex items-center justify-between gap-2 transition
          focus:outline-none focus:ring-2 focus:ring-[#017e84] focus:border-[#017e84]
          disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
          ${open ? "border-[#017e84] ring-2 ring-[#017e84]" : "border-gray-300"}
          ${!selected ? "text-gray-400" : "text-gray-900"}`}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <span className="flex items-center gap-1 shrink-0">
          {selected && !disabled && (
            <X
              size={14}
              className="text-gray-400 hover:text-gray-600"
              onClick={handleClear}
            />
          )}
          <ChevronDown
            size={15}
            className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
          {/* Search input */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full text-sm outline-none placeholder-gray-400"
            />
          </div>

          {/* Options */}
          <ul className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400 text-center">No results</li>
            ) : (
              filtered.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={`px-3 py-2 text-sm cursor-pointer transition-colors
                    ${String(value) === String(option.value)
                      ? "bg-[#017e84] text-white"
                      : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {option.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Main Form ──────────────────────────────────────────────────
export default function ProjectNumberForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { getProjects, createProject, updateProject, loading } = useProject();
  const { getPartners, loading: partnersLoading } = usePartner();

  const [partnerOptions, setPartnerOptions] = useState([]);
  const [form, setForm] = useState({
    project_name: "",
    partner_id: "",
  });

  // ── Fetch partners for dropdown ──────────────────────────────
  useEffect(() => {
    const fetchPartners = async () => {
      const result = await getPartners();
      if (result.success) {
        setPartnerOptions(
          result.data.map((p) => ({
            value: p.id,
            label: `${p.partner_code} — ${p.partner_name}`,
          }))
        );
      }
    };
    fetchPartners();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Prefill form when editing ────────────────────────────────
  useEffect(() => {
    if (!isEdit) return;
    const fetchAndPrefill = async () => {
      const result = await getProjects();
      if (result.success) {
        const match = result.data.find((p) => String(p.id) === String(id));
        if (match) {
          setForm({
            project_name: match.project_name ?? "",
            partner_id: match.partner_id ?? "",
          });
        }
      }
    };
    fetchAndPrefill();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      project_name: form.project_name.trim(),
      partner_id: Number(form.partner_id),
    };

    const result = isEdit
      ? await updateProject(id, payload)
      : await createProject(payload);

    if (result.success) navigate("/masters/project");
  };

  const inputClass =
    "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#017e84] focus:border-[#017e84] transition disabled:bg-gray-50 disabled:text-gray-400";

  const isSubmitting = loading;

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">

        {/* Header */}
        <div className="border-b px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800">
            {isEdit ? "Edit Project Number" : "Add Project Number"}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="project_name"
                value={form.project_name}
                onChange={(e) => setForm((prev) => ({ ...prev, project_name: e.target.value }))}
                required
                disabled={isSubmitting}
                placeholder="e.g. 209999-TEST"
                className={inputClass}
              />
            </div>

            {/* Partner — searchable dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Partner <span className="text-red-500">*</span>
              </label>
              {partnersLoading && partnerOptions.length === 0 ? (
                <div className="h-9 bg-gray-100 rounded-md animate-pulse" />
              ) : (
                <SearchableSelect
                  options={partnerOptions}
                  value={form.partner_id}
                  onChange={(val) => setForm((prev) => ({ ...prev, partner_id: val }))}
                  placeholder="Select partner"
                  disabled={isSubmitting}
                />
              )}
              {/* Hidden required guard */}
              <input
                type="text"
                required
                value={form.partner_id}
                onChange={() => {}}
                className="sr-only"
                tabIndex={-1}
                aria-hidden
              />
            </div>

            {/* Empty slot */}
            <div className="hidden lg:block" />

          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate("/masters/project-numbers")}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !form.partner_id}
              className="px-5 py-2 text-sm bg-[#017e84] text-white rounded-md hover:bg-[#01656a] shadow-sm disabled:opacity-50 transition"
            >
              {isSubmitting
                ? isEdit ? "Updating…" : "Saving…"
                : isEdit ? "Update Project" : "Save Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}