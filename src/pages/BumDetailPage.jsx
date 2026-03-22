import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import StatusBadge from "../components/StatusBadge";
import {
  ArrowLeft, Search, Eye, Check, SlidersHorizontal,
  ChevronUp, ChevronDown, CheckSquare, Square,
} from "lucide-react";

export default function BumDetailPage() {
  const { orderId, bumId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const order = state.orders.find((o) => o.id === orderId);
  const bum = order?.bums.find((b) => b.id === bumId);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  if (!order || !bum) return <div className="p-8 text-gray-400">Not found</div>;

  const filters = ["All", "Blocked", "Not Enough", "Waiting", "Available"];

  const matchFilter = (item) => {
    if (filter === "All") return true;
    if (filter === "Blocked") return item.status === "BLOCKED";
    if (filter === "Not Enough") return item.status === "NOT ENOUGH";
    if (filter === "Waiting") return item.status === "WAITING";
    if (filter === "Available") return !item.status || item.status === "ok";
    return true;
  };

  const matchSearch = (item) =>
    !search || item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.sub || "").toLowerCase().includes(search.toLowerCase());

  const visible = bum.items.filter((i) => matchFilter(i) && matchSearch(i));
  const deliverCount = bum.items.filter((i) => i.deliver).length;
  const allDelivering = bum.items.length > 0 && bum.items.every((i) => i.deliver);

  const handleQtyChange = (itemId, val) => {
    const n = parseFloat(val);
    if (!isNaN(n) && n >= 0) {
      dispatch({ type: "UPDATE_ITEM_QTY", orderId, bumId, itemId, qty: n });
    }
  };

  const toggleDeliver = (itemId) =>
    dispatch({ type: "TOGGLE_ITEM_DELIVER", orderId, bumId, itemId });

  const toggleAll = () =>
    dispatch({ type: "TOGGLE_BUM_ALL_DELIVER", orderId, bumId });

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 px-5 py-3 flex-shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate(`/orders/${orderId}`)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={14} /> Back to {orderId}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center text-sm font-bold text-violet-700 flex-shrink-0">
            {bum.code}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900">{bum.name}</h1>
            <p className="text-xs text-gray-400">{bum.sub} · {bum.items.length} items</p>
          </div>
          <StatusBadge status={bum.status} />
          <button
            onClick={() => navigate(`/orders/${orderId}/pickup`)}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
          >
            <Eye size={13} /> Pick-up List
          </button>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="bg-gray-50 border-b border-gray-200 px-5 py-2.5 flex items-center gap-4 flex-shrink-0 flex-wrap gap-y-1.5">
        <span className="text-xs text-gray-600"><span className="font-semibold text-gray-900">{bum.items.length}</span> total items</span>
        <span className="text-xs text-gray-600"><span className="font-semibold text-red-600">{bum.items.filter(i => i.status === "BLOCKED").length}</span> blocked</span>
        <span className="text-xs text-gray-600"><span className="font-semibold text-red-500">{bum.items.filter(i => i.status === "NOT ENOUGH").length}</span> not enough</span>
        <span className="text-xs text-gray-600"><span className="font-semibold text-blue-700">{bum.items.filter(i => i.status === "WAITING").length}</span> waiting</span>
        <div className="flex-1" />
        {deliverCount > 0 && (
          <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">
            ✓ {deliverCount} items to deliver
          </span>
        )}
        <button
          onClick={() => navigate(`/orders/${orderId}/pickup`)}
          className="text-xs text-violet-600 hover:text-violet-800 font-medium"
        >
          View in Pick-up List →
        </button>
      </div>

      {/* ── Search + Filters ── */}
      <div className="bg-white border-b border-gray-200 px-5 py-2.5 flex items-center gap-3 flex-shrink-0 flex-wrap gap-y-2">
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 flex-1 min-w-[180px] max-w-sm bg-gray-50">
          <Search size={13} className="text-gray-400 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="flex-1 text-xs bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === f ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400">{visible.length} shown</span>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-10 px-4 py-3">
                <button onClick={toggleAll} className="flex items-center justify-center text-gray-400 hover:text-gray-700">
                  {allDelivering
                    ? <CheckSquare size={16} className="text-green-600" />
                    : <Square size={16} />}
                </button>
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Item</th>
              <th className="text-right px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-32">Quantity</th>
              <th className="text-right px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-16">Unit</th>
              <th className="text-right px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-32">Status</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">Deliver Now</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => (
              <tr
                key={item.id}
                className={`border-b border-gray-100 transition-colors ${
                  item.deliver ? "bg-green-50 hover:bg-green-100" : "bg-white hover:bg-gray-50"
                }`}
              >
                {/* Checkbox */}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleDeliver(item.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all mx-auto ${
                      item.deliver
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-gray-300 hover:border-green-400 bg-white"
                    }`}
                  >
                    {item.deliver && <Check size={11} strokeWidth={3} />}
                  </button>
                </td>

                {/* Name */}
                <td className="px-3 py-3">
                  <p className={`text-xs font-semibold text-gray-800 ${item.deliver ? "" : ""}`}>
                    {item.name}
                  </p>
                  {item.sub && item.sub !== item.name && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{item.sub}</p>
                  )}
                </td>

                {/* Qty - editable */}
                <td className="px-3 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleQtyChange(item.id, Math.max(0, item.qty - 1))}
                      className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                      <ChevronDown size={12} />
                    </button>
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) => handleQtyChange(item.id, e.target.value)}
                      className="w-16 text-center text-sm font-bold text-gray-800 border border-gray-200 rounded-lg px-1 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      min="0"
                      step="0.5"
                    />
                    <button
                      onClick={() => handleQtyChange(item.id, item.qty + 1)}
                      className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                      <ChevronUp size={12} />
                    </button>
                  </div>
                </td>

                {/* Unit */}
                <td className="px-3 py-3 text-right text-xs text-gray-500 font-medium">{item.unit}</td>

                {/* Status */}
                <td className="px-3 py-3 text-right">
                  <StatusBadge status={item.status} />
                </td>

                {/* Deliver toggle */}
                <td className="px-3 py-3 text-center">
                  <button
                    onClick={() => toggleDeliver(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      item.deliver
                        ? "bg-green-500 text-white hover:bg-green-600 shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                    }`}
                  >
                    {item.deliver ? "✓ Deliver" : "Mark"}
                  </button>
                </td>
              </tr>
            ))}

            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">
                  No items match your search or filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Bottom bar ── */}
      <div className="bg-white border-t border-gray-200 px-5 py-3 flex items-center justify-between flex-shrink-0">
        <p className="text-xs text-gray-500">
          {deliverCount === 0
            ? "Tick the checkbox or click Mark to schedule items for delivery"
            : `${deliverCount} items from this BUM are in the pick-up list`}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/orders/${orderId}/pickup`)}
            className="flex items-center gap-1.5 px-4 py-2 border border-blue-300 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Eye size={14} /> Pick-up List
          </button>
          <button
            onClick={() => navigate(`/orders/${orderId}`)}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
