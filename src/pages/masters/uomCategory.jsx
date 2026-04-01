import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2 } from "lucide-react";

const STORAGE_KEY = "uomCategories";
const DEMO_UOMS = [
  { id: "uom1", name: "Piece" },
  { id: "uom2", name: "Kilogram" },
  { id: "uom3", name: "Meter" },
  { id: "uom4", name: "Liter" },
];

const loadUoms = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return DEMO_UOMS;
    }
  }
  return DEMO_UOMS;
};

const saveUoms = (uoms) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(uoms));
};

export default function UomCategoryList() {
  const [uoms, setUoms] = useState(loadUoms);

  useEffect(() => {
    saveUoms(uoms);
  }, [uoms]);

  const handleDelete = (id) => {
    if (window.confirm("Delete this UOM category?")) {
      setUoms(uoms.filter(u => u.id !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">UOM Categories</h1>
        <Link
          to="/masters/uomcategories/add"
          className="bg-[#017e84] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#015f64]"
        >
          <Plus size={18} /> Add UOM
        </Link>
      </div>
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">UOM Name</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {uoms.map(uom => (
              <tr key={uom.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{uom.name}</td>
                <td className="px-6 py-4 text-right text-sm">
                  <button
                    className="text-blue-600 hover:text-blue-800 mr-2"
                    onClick={() => {/* TODO: edit */}}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(uom.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {uoms.length === 0 && (
              <tr>
                <td colSpan="2" className="px-6 py-8 text-center text-gray-500">
                  No UOM categories found. Click "Add UOM" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}