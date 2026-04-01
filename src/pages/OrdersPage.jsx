import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";  // ✅ Redux
import { ClipboardList, Plus } from "lucide-react";
import StatusBadge from "../components/StatusBadge";

export default function OrdersPage() {
  const navigate = useNavigate();

  // ✅ Redux selector
  const orders = useSelector((s) => s.orders?.orders || []);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <ClipboardList size={24} className="text-gray-300" />
      </div>
      <p className="text-base font-semibold text-gray-700">
        {orders.length} Manufacturing Order{orders.length !== 1 ? "s" : ""}
      </p>
      <p className="text-sm text-gray-400 mt-1 mb-5">
        Select an order from the list on the left.
      </p>

      <div className="w-full max-w-sm space-y-2">
        {orders.map((o) => {
          // ✅ updated field names to match API shape
          const deliverCount = (o.boms || [])
            .flatMap((b) => b.items || [])
            .filter((i) => i.deliver).length;

          return (
            <button
              key={o.id}
              onClick={() => navigate(`/orders/${o.id}`)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded hover:border-[#017e84] hover:bg-[#f0fafa] transition-all text-left"
            >
              <div className="w-9 h-9 rounded border border-gray-200 bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                {o.requisition_no?.slice(-4) || "MRN"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{o.requisition_no}</p>
                <p className="text-xs text-gray-400">
                  {o.id}{o.project_name ? ` · ${o.project_name}` : ""}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <StatusBadge status={o.status} />
                {deliverCount > 0 && (
                  <span className="text-xs text-green-600 font-medium">{deliverCount} ✓</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => navigate("/orders/add")}
        className="mt-5 flex items-center gap-1.5 px-4 py-2 bg-[#017e84] text-white rounded text-sm font-medium hover:bg-[#015f64] transition-colors"
      >
        <Plus size={14} /> New Order
      </button>
    </div>
  );
}