import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2 } from "lucide-react";

const STORAGE_KEY = "manufacturers";
const DEMO_MANUFACTURERS = [
  { id: "man1", name: "Siemens" },
  { id: "man2", name: "ABB" },
  { id: "man3", name: "Bosch" },
  { id: "man4", name: "Schneider Electric" },
];

const loadManufacturers = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return DEMO_MANUFACTURERS;
    }
  }
  return DEMO_MANUFACTURERS;
};

const saveManufacturers = (manufacturers) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(manufacturers));
};

export default function ManufacturerList() {
  const [manufacturers, setManufacturers] = useState(loadManufacturers);

  useEffect(() => {
    saveManufacturers(manufacturers);
  }, [manufacturers]);

  const handleDelete = (id) => {
    if (window.confirm("Delete this manufacturer?")) {
      setManufacturers(manufacturers.filter(m => m.id !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Manufacturers</h1>
        <Link
          to="/masters/manufacturers/add"
          className="bg-[#017e84] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#015f64]"
        >
          <Plus size={18} /> Add Manufacturer
        </Link>
      </div>
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manufacturer Name</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {manufacturers.map(man => (
              <tr key={man.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{man.name}</td>
                <td className="px-6 py-4 text-right text-sm">
                  <button
                    className="text-blue-600 hover:text-blue-800 mr-2"
                    onClick={() => {/* TODO: edit */}}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(man.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {manufacturers.length === 0 && (
              <tr>
                <td colSpan="2" className="px-6 py-8 text-center text-gray-500">
                  No manufacturers found. Click "Add Manufacturer" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}