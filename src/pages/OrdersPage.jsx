import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ClipboardList, Plus } from "lucide-react";
import StatusBadge from "../components/StatusBadge";

export default function OrdersPage() {
  const { state } = useApp();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
        <ClipboardList size={28} className="text-violet-400" />
      </div>
      <p className="text-base font-semibold text-gray-700">
        {state.orders.length} Manufacturing Order{state.orders.length !== 1 ? "s" : ""}
      </p>
      <p className="text-sm text-gray-400 mt-1 mb-6">
        Select an order from the list on the left to view and manage it.
      </p>

      {/* Quick jump cards */}
      <div className="w-full max-w-sm space-y-2">
        {state.orders.map((o) => {
          const deliverCount = o.bums.flatMap((b) => b.items).filter((i) => i.deliver).length;
          return (
            <button
              key={o.id}
              onClick={() => navigate(`/orders/${o.id}`)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-violet-300 hover:bg-violet-50 transition-all text-left shadow-sm"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                {o.productCode}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{o.productName}</p>
                <p className="text-xs text-gray-400">{o.id} · {o.location}</p>
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

      <button className="mt-6 flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors">
        <Plus size={15} /> New Order
      </button>
    </div>
  );
}
