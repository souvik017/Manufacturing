// pages/masters/ProjectNumberList.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import useProject from "../../hooks/useProject";
import Pagination from "../../components/pagination";

const STATUS_LABELS = {
  "1": { label: "Active",   className: "bg-green-100 text-green-700" },
  "0": { label: "Inactive", className: "bg-red-100 text-red-700"   },
};

export default function ProjectNumberList() {
  const { getProjects, deleteProject, loading } = useProject();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(50);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const debounceRef = useRef(null);

  const fetchProjects = useCallback(async () => {
    const result = await getProjects({ limit, page, search });
    if (result?.success) {
      setProjects(result.data || []);
      if (result.pagination) {
        setTotalPages(result.pagination.total_pages || 1);
        setTotalRecords(result.pagination.total_records || 0);
      } else {
        setTotalPages(1);
        setTotalRecords(result.data?.length || 0);
      }
    }
  }, [limit, page, search]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    const result = await deleteProject(id);
    if (result.success) {
      if (projects.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchProjects();
      }
    }
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Project Numbers</h1>
          {!loading && totalRecords > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">
              {totalRecords} {totalRecords === 1 ? "project" : "projects"} total
            </p>
          )}
        </div>
              {/* Search & Show entries */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="relative w-[20vw] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by project name or partner…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#017e84]"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Show</label>
          <select
            value={limit}
            onChange={handleLimitChange}
            className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#017e84]"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-600">entries</span>
        </div>
                <Link
          to="/masters/project/add"
          className="bg-[#017e84] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#015f64]"
        >
          <Plus size={18} /> Add Project
        </Link>

      </div>

      </div>


      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              Array.from({ length: Math.min(limit, 50) }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-6" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-36" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28" /></td>
                  <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded-full w-16" /></td>
                  <td className="px-6 py-4 flex justify-end gap-3">
                    <div className="h-4 bg-gray-200 rounded w-8" />
                    <div className="h-4 bg-gray-200 rounded w-8" />
                  </td>
                </tr>
              ))
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  No projects found. Click "Add Project" to create one.
                </td>
              </tr>
            ) : (
              projects.map((proj, idx) => {
                const status = STATUS_LABELS[String(proj.status)] ?? {
                  label: "Unknown",
                  className: "bg-gray-100 text-gray-600",
                };
                return (
                  <tr key={proj.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {(page - 1) * limit + idx + 1}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {proj.project_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {proj.partner_name}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <Link
                        to={`/masters/project/edit/${proj.id}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 mr-3"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(proj.id)}
                        disabled={loading}
                        title="Delete"
                        className="inline-flex items-center text-red-600 hover:text-red-800 disabled:opacity-40"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}