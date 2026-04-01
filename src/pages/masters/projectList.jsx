import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, RefreshCw } from "lucide-react";
import useProject from "../../hooks/useProject";

const STATUS_LABELS = {
  "1": { label: "Active", className: "bg-green-100 text-green-700" },
  "0": { label: "Inactive", className: "bg-red-100 text-red-700" },
};

export default function ProjectNumberList() {
  const [projects, setProjects] = useState([]);
  const { getProjects, deleteProject, loading } = useProject();

  const fetchProjects = async () => {
    const result = await getProjects();
    if (result.success) {
      setProjects(result.data);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this project?")) {
      const result = await deleteProject(id);
      if (result.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Project Numbers</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProjects}
            disabled={loading}
            className="border border-gray-300 text-gray-600 px-3 py-2 rounded-md flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <Link
            to="/masters/project/add"
            className="bg-[#017e84] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#015f64]"
          >
            <Plus size={18} /> Add Project
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Partner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading && projects.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw size={16} className="animate-spin" />
                    Loading projects...
                  </div>
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No projects found. Click "Add Project" to create one.
                </td>
              </tr>
            ) : (
              projects.map((proj, index) => {
                const status = STATUS_LABELS[proj.status] ?? {
                  label: "Unknown",
                  className: "bg-gray-100 text-gray-600",
                };
                return (
                  <tr key={proj.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-400">{index + 1}</td>
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
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(proj.id)}
                        disabled={loading}
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
    </div>
  );
}