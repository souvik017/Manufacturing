import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, RefreshCw } from "lucide-react";
import usePartner from "../../hooks/usePartner";

export default function PartnerList() {
  const [partners, setPartners] = useState([]);
  const { getPartners, deletePartner, loading } = usePartner();

  const fetchPartners = async () => {
    const result = await getPartners();
    if (result.success) {
      setPartners(result.data);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this partner?")) {
      const result = await deletePartner(id);
      if (result.success) {
        setPartners((prev) => prev.filter((p) => p.id !== id));
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Partners</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPartners}
            disabled={loading}
            className="border border-gray-300 text-gray-600 px-3 py-2 rounded-md flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <Link
            to="/masters/partners/add"
            className="bg-[#017e84] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#015f64]"
          >
            <Plus size={18} /> Add Partner
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
                Partner Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Partner Name
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading && partners.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw size={16} className="animate-spin" />
                    Loading partners...
                  </div>
                </td>
              </tr>
            ) : partners.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  No partners found. Click "Add Partner" to create one.
                </td>
              </tr>
            ) : (
              partners.map((partner, index) => (
                <tr key={partner.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-400">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {partner.partner_code}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {partner.partner_name}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <Link
                      to={`/masters/partners/edit/${partner.id}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 mr-3"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(partner.id)}
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