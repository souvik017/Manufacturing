// BomList.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import useBom from "../../hooks/useBom";

export default function BomList() {
  const navigate = useNavigate();
  const { getBoms, deleteBom, loading } = useBom();

  const [boms, setBoms] = useState([]);
  const [search, setSearch] = useState("");
  const debounceRef = useRef(null);

  /* ==========================
     FETCH BOM LIST
  ========================== */
  const fetchBoms = useCallback(async (bomName = "") => {
    const res = await getBoms(bomName);
    if (res?.success) {
      setBoms(res.data || []);
    }
  }, []);

  useEffect(() => {
    fetchBoms();
  }, []);

  /* ==========================
     DEBOUNCED SEARCH
  ========================== */
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchBoms(val);
    }, 400);
  };

  /* ==========================
     DELETE
  ========================== */
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this BOM?")) return;
    const res = await deleteBom(id);
    if (res?.success) {
      fetchBoms(search);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">BOMs</h1>
        <button
          onClick={() => navigate("/masters/bom/add")}
          className="bg-[#017e84] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#015f64]"
        >
          <Plus size={18} /> Add BOM
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 relative w-full max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by BOM name…"
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#017e84]"
        />
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">

          {/* HEADER */}
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BOM Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Article No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Drawing No</th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No of items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">UOM</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-gray-200">
            {boms.map((bom) => (
              <tr
                key={bom.bom_id}
                onClick={() => navigate(`/masters/bom/edit/${bom.bom_id}`)}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm text-gray-900">{bom.bom_name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{bom.article_no}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{bom.product_name}</td>
                {/* <td className="px-6 py-4 text-sm text-gray-500">{bom.drawing_no || "-"}</td> */}
                <td className="px-6 py-4 text-sm text-gray-500">
                  {/* {bom.items?.reduce((sum, item) => sum + Number(item.qty || 0), 0)} */}
                {Array.isArray(bom.items) ? bom.items.length : 0}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{bom.uom_name}</td>
                <td className="px-6 py-4 text-right text-sm">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/masters/bom/edit/${bom.bom_id}`); }}
                    className="text-blue-600 hover:text-blue-800 mr-2"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, bom.bom_id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {!loading && boms.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No BOMs found. Click "Add BOM" to create one.
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}