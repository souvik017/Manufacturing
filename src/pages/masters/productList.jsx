// pages/masters/ProductList.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import useProduct from "../../hooks/useProduct";
import Pagination from "../../components/pagination" // ← capital P

export default function ProductList() {
  const { getProducts, deleteProduct, loading } = useProduct();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(50);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  const fetchProducts = useCallback(async () => {
    const result = await getProducts({ limit, page, search });
    if (result?.success) {
      setProducts(result.data || []);
      if (result.pagination) {
        setTotalPages(result.pagination.total_pages || 1);
        setTotalRecords(result.pagination.total_records || 0);
      } else {
        setTotalPages(1);
        setTotalRecords(result.data?.length || 0);
      }
    }
  }, [limit, page, search]);

  // Fetch when limit, page, or search changes
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); // fetchProducts already includes limit, page, search

  // Debounced search – only update search state, let useEffect fetch
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1); // reset to first page
    // Debounce is handled by the useEffect (search changes trigger fetch)
    // No extra setTimeout call needed
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this product?")) {
      const result = await deleteProduct(id);
      if (result.success) {
        if (products.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          fetchProducts(); // refresh current page
        }
      }
    }
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  return (
    <div className="p-6">
      {/* Header with title and total count */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          {!loading && totalRecords > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">
              {totalRecords} {totalRecords === 1 ? "product" : "products"} total
            </p>
          )}
        </div>
        <button
          onClick={() => navigate("/masters/products/add")}
          className="bg-[#017e84] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#015f64]"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Search & Show entries row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="relative w-[20vw] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by product name…"
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
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Article No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">UOM</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manufacturer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              Array.from({ length: Math.min(limit, 50) }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16 ml-auto" /></td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  No products found. Click "Add Product" to create one.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{product.article_no}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{product.product_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{product.category_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{product.uom_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{product.manufacturer_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{product.partner_name}</td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button
                      className="text-blue-600 hover:text-blue-800 mr-2"
                      onClick={() => navigate(`/masters/products/edit/${product.id}`)}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-800"
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