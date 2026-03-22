import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Search, SlidersHorizontal, Plus } from "lucide-react";
import { useState } from "react";

export default function OrderList() {
  const { state } = useApp();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = state.orders.filter(
    (o) =>
      !search.trim() ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.productName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 h-full">

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
        <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50">
          <Search size={14} className="text-gray-500" />
        </button>
        <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 text-white rounded-full text-xs font-medium">
          All <span className="text-gray-300 text-xs ml-0.5">▾</span>
        </button>
        <div className="flex-1" />
        <button
          onClick={() => {}}
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Plus size={14} className="text-gray-500" />
        </button>
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-100">
        <SlidersHorizontal size={12} className="text-gray-400" />
        <span className="text-xs text-gray-400">Filters</span>
      </div>

      {/* Inline search */}
      <div className="px-3 py-2 border-b border-gray-100">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Order number"
          className="w-full text-xs text-gray-600 placeholder-gray-400 focus:outline-none bg-transparent"
        />
      </div>

      {/* Order list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-8">No orders found</p>
        )}
        {filtered.map((order) => {
          const isActive = order.id === orderId;
          const deliverCount = order.bums.flatMap((b) => b.items).filter((i) => i.deliver).length;
          return (
            <div
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className={`flex items-center gap-3 px-3 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                isActive
                  ? "bg-blue-50 border-l-2 border-l-blue-500"
                  : "border-l-2 border-l-transparent"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                {order.productCode}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-800 truncate">{order.productName}</p>
                <p className="text-xs text-gray-400 mt-0.5">{order.id}</p>
                {deliverCount > 0 && (
                  <span className="text-xs text-green-600 font-medium">{deliverCount} for delivery</span>
                )}
              </div>
              {/* Status dot */}
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                order.status === "In progress" ? "bg-blue-400" :
                order.status === "Complete"    ? "bg-green-400" :
                "bg-gray-300"
              }`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
