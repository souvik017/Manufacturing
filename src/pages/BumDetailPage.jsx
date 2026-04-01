import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";  // ✅ Redux
import {
  updateItemQty,
  toggleItemDeliver,
  toggleBumAllDeliver,
} from "../redux/Slices/orderSlice";  // ✅ Redux actions
import StatusBadge from "../components/StatusBadge";
import { ArrowLeft, Search, Eye, Check, X, MoreHorizontal } from "lucide-react";

export default function BumDetailPage() {
  const { orderId, bumId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();  // ✅ Redux

  // ✅ Redux selectors
  const order = useSelector((s) =>
    (s.orders?.orders || []).find((o) => String(o.id) === String(orderId))
  );
  const bum = order?.boms?.find((b) => String(b.bom_id) === String(bumId));

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
    !search ||
    (item.product_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (item.article_no || "").toLowerCase().includes(search.toLowerCase());

  const items = bum.items || [];
  const visible = items.filter((i) => matchFilter(i) && matchSearch(i));
  const deliverCount = items.filter((i) => i.deliver).length;
  const allDelivering = items.length > 0 && items.every((i) => i.deliver);

  // ✅ Redux actions
  const handleQtyChange = (itemId, val) => {
    const n = parseFloat(val);
    if (!isNaN(n) && n >= 0)
      dispatch(updateItemQty({ orderId, bumId, itemId, qty: n }));
  };

  const handleToggleDeliver = (itemId) =>
    dispatch(toggleItemDeliver({ orderId, bumId, itemId }));

  const handleToggleAll = () =>
    dispatch(toggleBumAllDeliver({ orderId, bumId }));

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => navigate(`/orders/${orderId}`)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#017e84] transition-colors"
        >
          <ArrowLeft size={13} /> Back
        </button>
        <div className="w-px h-4 bg-gray-200" />
        <span className="text-xs text-[#017e84] font-medium">{orderId}</span>
        <span className="text-gray-300 text-xs">/</span>
        <span className="text-xs font-semibold text-gray-700">{bum.bom_name}</span>
        <div className="flex-1" />
        <StatusBadge status={bum.status} />
      </div>

      {/* Subheader */}
      <div className={`px-4 py-3 border-b border-gray-200 flex items-center gap-4 ${
        bum.status === "BLOCKED" ? "bg-[#fff5f5] border-l-4 border-l-[#e04c4c]" : "bg-gray-50"
      }`}>
        <div className="w-10 h-10 rounded border border-gray-200 bg-white flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
          {bum.bom_name?.charAt(0)?.toUpperCase() || "B"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">{bum.bom_name}</p>
          <p className="text-xs text-gray-500">
            {bum.product_name && `${bum.product_name} · `}{items.length} items
          </p>
        </div>
        {deliverCount > 0 && (
          <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
            {deliverCount} for delivery
          </span>
        )}
        <button
          onClick={() => navigate(`/orders/${orderId}/pickup`)}
          className="flex items-center gap-1.5 text-xs text-[#017e84] hover:underline font-medium"
        >
          <Eye size={13} /> Pick list
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-white flex-shrink-0 flex-wrap gap-y-2">
        <div className="flex items-center gap-1.5 border border-gray-200 rounded px-2.5 py-1.5 bg-white min-w-[180px]">
          <Search size={12} className="text-gray-400 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items…"
            className="flex-1 text-xs bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
              <X size={11} />
            </button>
          )}
        </div>
        <div className="flex gap-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors border ${
                filter === f
                  ? "bg-[#2c2c2c] text-white border-[#2c2c2c]"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        {/* ✅ Redux action */}
        <button
          onClick={handleToggleAll}
          className={`text-xs font-medium px-3 py-1.5 rounded border transition-colors ${
            allDelivering
              ? "bg-green-500 text-white border-green-500"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
        >
          {allDelivering ? "✓ All selected" : "Select all"}
        </button>
      </div>

      {/* Items table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="w-12 px-4 py-2.5 text-xs font-semibold text-gray-400 text-center uppercase tracking-wide" />
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Component</th>
              <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Qty</th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-16">Unit</th>
              <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">Status</th>
              <th className="w-12 px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => (
              <tr
                key={item.product_id}
                className={`border-b border-gray-100 group hover:bg-gray-50 transition-colors ${
                  item.deliver ? "bg-green-50" : ""
                }`}
              >
                <td className="px-4 py-2 w-12">
                  <div className="w-8 h-8 rounded border border-gray-200 bg-gray-50 flex items-center justify-center mx-auto">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                    </svg>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <p className="text-xs font-semibold text-gray-900">{item.product_name}</p>
                  {item.article_no && item.article_no !== item.product_name && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate max-w-lg">{item.article_no}</p>
                  )}
                </td>
                <td className="px-3 py-2 w-24 text-right">
                  {/* ✅ Redux action */}
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) => handleQtyChange(item.product_id, e.target.value)}
                    className="w-16 text-right text-sm text-gray-800 border-0 focus:outline-none focus:ring-1 focus:ring-[#017e84] rounded px-1 py-0.5 bg-transparent hover:bg-gray-100"
                    min="0"
                    step="0.5"
                  />
                </td>
                <td className="px-3 py-2 w-16 text-xs text-gray-500">{item.uom_name}</td>
                <td className="px-3 py-2 w-36 text-right">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-3 py-2 w-12 text-center">
                  {/* ✅ Redux action */}
                  <button
                    onClick={() => handleToggleDeliver(item.product_id)}
                    className={`w-5 h-5 flex items-center justify-center mx-auto ${
                      item.deliver ? "text-green-600" : "text-gray-300 hover:text-gray-500"
                    }`}
                  >
                    <Check size={16} strokeWidth={item.deliver ? 2.5 : 1.5} />
                  </button>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-sm text-gray-400">
                  No items match your filter
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}