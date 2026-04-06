// pages/ManufacturerList.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import useManufacture from "../../hooks/useManufacture";

const PAGE_SIZE = 10;

export default function ManufacturerList() {
  const { getManufacturers, deleteManufacturer, loading, manufacturers } = useManufacture();
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  // Load manufacturers on component mount
  useEffect(() => {
    loadManufacturers();
  }, []);

  const loadManufacturers = async () => {
    const result = await getManufacturers();
    if (!result.success) {
      setError(result.error || "Failed to load manufacturers");
    } else {
      setError("");
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete manufacturer "${name}"? This action cannot be undone.`)) {
      setIsDeleting(true);
      const result = await deleteManufacturer(id);
      if (!result.success) {
        setError(result.error || "Failed to delete manufacturer");
      }
      setIsDeleting(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(manufacturers.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentManufacturers = manufacturers.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (loading && manufacturers.length === 0) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#017e84] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading manufacturers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Manufacturers</h1>
          <p className="text-sm text-gray-500 mt-1">
            Total: {manufacturers.length} manufacturers
          </p>
        </div>
        <Link
          to="/masters/manufacturers/add"
          className="bg-[#017e84] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#015f64] transition"
        >
          <Plus size={18} /> Add Manufacturer
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                S.No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Manufacturer Name
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentManufacturers.map((manufacturer, index) => (
              <tr key={manufacturer.id || manufacturer._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm text-gray-500">
                  {startIndex + index + 1}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                  {manufacturer.manufacturer_name || manufacturer.name}
                </td>
                <td className="px-6 py-4 text-right text-sm">
                  <Link
                    to={`/masters/manufacturers/edit/${manufacturer.id || manufacturer._id}`}
                    state={{ manufacturer }}
                    className="text-blue-600 hover:text-blue-800 mr-3 inline-flex items-center gap-1"
                  >
                    <Edit size={16} /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(manufacturer.id || manufacturer._id, manufacturer.manufacturer_name || manufacturer.name)}
                    disabled={isDeleting}
                    className="text-red-600 hover:text-red-800 inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {currentManufacturers.length === 0 && !loading && (
              <tr>
                <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                  No manufacturers found. Click "Add Manufacturer" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && manufacturers.length > PAGE_SIZE && totalPages > 0 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-sm text-gray-500">
            Showing {startIndex + 1}–{Math.min(endIndex, manufacturers.length)} of{" "}
            {manufacturers.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} />
            </button>

            {getPageNumbers().map((page, i) =>
              page === "..." ? (
                <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">
                  …
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`min-w-[36px] h-9 rounded-md text-sm font-medium border transition ${
                    currentPage === page
                      ? "bg-[#017e84] text-white border-[#017e84]"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}