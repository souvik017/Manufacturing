import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, RefreshCw } from "lucide-react";
import useProduct from "../../hooks/useProduct";

export default function ProductCategoryList() {
  const [categories, setCategories] = useState([]);
  const { getProductCategories, deleteProduct, loading } = useProduct();

  const fetchCategories = async () => {
    const result = await getProductCategories();
    if (result.success) {
      setCategories(result.data);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this category?")) {
      const result = await deleteProduct(id);
      if (result.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Product Categories</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCategories}
            disabled={loading}
            className="border border-gray-300 text-gray-600 px-3 py-2 rounded-md flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <Link
            to="/masters/productcategories/add"
            className="bg-[#017e84] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#015f64]"
          >
            <Plus size={18} /> Add Category
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
                Category Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading && categories.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw size={16} className="animate-spin" />
                    Loading categories...
                  </div>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  No categories found. Click "Add Category" to create one.
                </td>
              </tr>
            ) : (
              categories.map((cat, index) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-400">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {cat.category_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {cat.created_at && cat.created_at !== "0000-00-00 00:00:00"
                      ? new Date(cat.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <Link
                      to={`/masters/productcategories/edit/${cat.id}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 mr-3"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      disabled={loading}
                      className="inline-flex items-center text-red-600 hover:text-red-800 disabled:opacity-40"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}