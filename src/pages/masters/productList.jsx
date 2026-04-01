// ProductList.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import useProduct from "../../hooks/useProduct";

export default function ProductList() {
  const { getProducts, deleteProduct, loading } = useProduct();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = useCallback(async (productName = "") => {
    const result = await getProducts(productName);
    if (result?.success) {
      setProducts(result.data || []);
    }
  }, []);

  /* ==========================
     DEBOUNCED SEARCH
  ========================== */
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchProducts(val);
    }, 400);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this product?")) {
      const result = await deleteProduct(id);
      if (result.success) {
        setProducts(products.filter((p) => p.id !== id));
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Products</h1>
        <button
          onClick={() => navigate("/masters/products/add")}
          className="bg-[#017e84] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#015f64]"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 relative w-full max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by product name…"
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#017e84]"
        />
      </div>

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
            {products.map((product) => (
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
            ))}
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No products found. Click "Add Product" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}