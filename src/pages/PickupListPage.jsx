import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import StatusBadge from "../components/StatusBadge";
import {
  ArrowLeft, Search, Printer, Download, ChevronDown,
  ChevronRight, Check, ChevronUp, CheckSquare, Square,
  Package, AlertTriangle,
} from "lucide-react";

export default function PickupListPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const order = state.orders.find((o) => o.id === orderId);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState(() =>
    Object.fromEntries((order?.bums || []).map((b) => [b.id, true]))
  );
  const [showAll, setShowAll] = useState(false);

  if (!order) return <div className="p-8 text-gray-400">Order not found</div>;

  // All items that are marked for delivery OR showAll is true
  const getBumItems = (bum) => {
    return showAll ? bum.items : bum.items.filter((i) => i.deliver);
  };

  const allDeliverItems = order.bums.flatMap((b) => b.items.filter((i) => i.deliver));
  const totalDeliverItems = allDeliverItems.length;

  const filters = ["All", "Not Enough", "Waiting", "Blocked", "Available"];
  const matchFilter = (item) => {
    if (filter === "All") return true;
    if (filter === "Blocked") return item.status === "BLOCKED";
    if (filter === "Not Enough") return item.status === "NOT ENOUGH";
    if (filter === "Waiting") return item.status === "WAITING";
    if (filter === "Available") return !item.status || item.status === "ok";
    return true;
  };
  const matchSearch = (item) =>
    !search.trim() || item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.sub || "").toLowerCase().includes(search.toLowerCase());

  const handleQtyChange = (bumId, itemId, val) => {
    const n = parseFloat(val);
    if (!isNaN(n) && n >= 0) {
      dispatch({ type: "UPDATE_ITEM_QTY", orderId, bumId, itemId, qty: n });
    }
  };

  const toggleDeliver = (bumId, itemId) =>
    dispatch({ type: "TOGGLE_ITEM_DELIVER", orderId, bumId, itemId });

  const toggleGroup = (bumId) =>
    setExpanded((prev) => ({ ...prev, [bumId]: !prev[bumId] }));

  const toggleBumAll = (bumId) =>
    dispatch({ type: "TOGGLE_BUM_ALL_DELIVER", orderId, bumId });

  // Stats
  const allItems = order.bums.flatMap((b) => b.items);
  const notEnoughCount = allDeliverItems.filter((i) => i.status === "NOT ENOUGH").length;
  const waitingCount = allDeliverItems.filter((i) => i.status === "WAITING").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 px-5 py-3 flex-shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate(`/orders/${orderId}`)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={14} /> Back to {orderId}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Package size={18} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900">Pick-up List</h1>
            <p className="text-xs text-gray-400">{order.productName} · {order.id}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50"
            >
              <Printer size={13} /> Print
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50">
              <Download size={13} /> Export
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="bg-gray-50 border-b border-gray-200 px-5 py-2.5 flex items-center gap-4 flex-shrink-0 flex-wrap gap-y-1.5">
        <span className="text-xs text-gray-600">
          <span className="font-semibold text-gray-900">{totalDeliverItems}</span> items for delivery
        </span>
        <span className="text-xs text-gray-600">
          <span className="font-semibold text-gray-900">{order.bums.filter(b => getBumItems(b).length > 0).length}</span> BUM groups
        </span>
        {notEnoughCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-red-600">
            <AlertTriangle size={12} />
            <span className="font-semibold">{notEnoughCount}</span> not enough stock
          </span>
        )}
        {waitingCount > 0 && (
          <span className="text-xs text-blue-700">
            <span className="font-semibold">{waitingCount}</span> waiting
          </span>
        )}
        <div className="flex-1" />

        {/* Toggle all / delivery only */}
        <button
          onClick={() => setShowAll(!showAll)}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${
            showAll
              ? "bg-gray-800 text-white border-gray-800"
              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
          }`}
        >
          {showAll ? "Showing All Items" : "Showing Delivery Items Only"}
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
      </div>

      {/* ── Table header ── */}
      <div className="bg-gray-50 border-b border-gray-200 flex-shrink-0">
        <div
          className="grid text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-2.5"
          style={{ gridTemplateColumns: "36px 1fr 140px 60px 130px 110px" }}
        >
          <div />
          <div>Item</div>
          <div className="text-center">Quantity</div>
          <div className="text-right">Unit</div>
          <div className="text-right">Status</div>
          <div className="text-center">Deliver</div>
        </div>
      </div>

      {/* ── Grouped rows ── */}
      <div className="flex-1 overflow-y-auto">
        {order.bums.map((bum) => {
          const bumItems = getBumItems(bum).filter(
            (i) => matchFilter(i) && matchSearch(i)
          );
          if (bumItems.length === 0 && !showAll) return null;
          if (bumItems.length === 0 && showAll && !bum.name.toLowerCase().includes(search.toLowerCase())) return null;

          const isExpanded = expanded[bum.id];
          const allBumDelivering = bum.items.length > 0 && bum.items.every((i) => i.deliver);
          const someBumDelivering = bum.items.some((i) => i.deliver);
          const isBlocked = bum.status === "BLOCKED";
          const isStart = bum.status === "START";

          return (
            <div key={bum.id}>
              {/* Group header */}
              <div
                className={`grid items-center px-5 py-3 border-b border-gray-200 cursor-pointer hover:bg-opacity-90 transition-colors ${
                  isBlocked ? "bg-red-50 border-l-4 border-l-red-400"
                  : isStart ? "bg-blue-50 border-l-4 border-l-blue-400"
                  : "bg-gray-100 border-l-4 border-l-transparent"
                }`}
                style={{ gridTemplateColumns: "36px 1fr 140px 60px 130px 110px" }}
              >
                {/* Expand toggle */}
                <button
                  onClick={() => toggleGroup(bum.id)}
                  className="text-gray-500 flex items-center justify-center"
                >
                  {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </button>

                {/* Name */}
                <div
                  className="flex items-center gap-2.5 min-w-0"
                  onClick={() => toggleGroup(bum.id)}
                >
                  <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-700 flex-shrink-0">
                    {bum.code}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800">{bum.name}</p>
                    <p className="text-xs text-gray-500">{bum.sub} · {getBumItems(bum).length} items</p>
                  </div>
                </div>

                {/* Qty placeholder */}
                <div className="text-center">
                  <span className="text-sm font-bold text-gray-700">{bum.qty}</span>
                  <span className="text-xs text-gray-400 ml-1">{bum.unit}</span>
                </div>

                <div />

                {/* Status */}
                <div className="flex justify-end">
                  <StatusBadge status={bum.status} />
                </div>

                {/* Select all in group */}
                <div className="flex justify-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleBumAll(bum.id); }}
                    title={allBumDelivering ? "Unselect all" : "Select all"}
                    className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
                      allBumDelivering ? "text-green-600 hover:text-green-800"
                      : someBumDelivering ? "text-green-400 hover:text-green-600"
                      : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {allBumDelivering ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                </div>
              </div>

              {/* Item rows */}
              {isExpanded && bumItems.map((item) => (
                <div
                  key={item.id}
                  className={`grid items-center px-5 py-2.5 border-b border-gray-100 transition-colors ${
                    item.deliver ? "bg-green-50 hover:bg-green-100" : "bg-white hover:bg-gray-50"
                  }`}
                  style={{ gridTemplateColumns: "36px 1fr 140px 60px 130px 110px", paddingLeft: "56px" }}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleDeliver(bum.id, item.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      item.deliver
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-gray-300 hover:border-green-400 bg-white"
                    }`}
                  >
                    {item.deliver && <Check size={11} strokeWidth={3} />}
                  </button>

                  {/* Name */}
                  <div className="min-w-0 pl-1">
                    <p className="text-xs font-semibold text-gray-800">{item.name}</p>
                    {item.sub && item.sub !== item.name && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{item.sub}</p>
                    )}
                  </div>

                  {/* Qty - editable */}
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleQtyChange(bum.id, item.id, Math.max(0, item.qty - 1))}
                      className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
                    >
                      <ChevronDown size={11} />
                    </button>
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) => handleQtyChange(bum.id, item.id, e.target.value)}
                      className="w-14 text-center text-sm font-bold text-gray-800 border border-gray-200 rounded-lg px-1 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      min="0"
                      step="0.5"
                    />
                    <button
                      onClick={() => handleQtyChange(bum.id, item.id, item.qty + 1)}
                      className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
                    >
                      <ChevronUp size={11} />
                    </button>
                  </div>

                  {/* Unit */}
                  <div className="text-right text-xs text-gray-500 font-medium">{item.unit}</div>

                  {/* Status */}
                  <div className="flex justify-end">
                    <StatusBadge status={item.status} />
                  </div>

                  {/* Deliver button */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => toggleDeliver(bum.id, item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        item.deliver
                          ? "bg-green-500 text-white hover:bg-green-600 shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                      }`}
                    >
                      {item.deliver ? "✓ Deliver" : "Mark"}
                    </button>
                  </div>
                </div>
              ))}

              {/* No items in this group after filter */}
              {isExpanded && bumItems.length === 0 && (
                <div className="px-14 py-3 text-xs text-gray-400 italic border-b border-gray-100 bg-white">
                  No items match the current filter
                </div>
              )}
            </div>
          );
        })}

        {/* Global empty state */}
        {!showAll && totalDeliverItems === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Package size={40} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">No items marked for delivery yet</p>
            <p className="text-xs mt-1">Go into a BUM group and tick items to deliver</p>
            <button
              onClick={() => navigate(`/orders/${orderId}`)}
              className="mt-4 text-xs text-violet-600 hover:text-violet-800 font-medium"
            >
              ← Back to order
            </button>
          </div>
        )}
      </div>

      {/* ── Bottom bar ── */}
      <div className="bg-white border-t border-gray-200 px-5 py-3 flex items-center justify-between flex-shrink-0">
        <p className="text-xs text-gray-500">
          {totalDeliverItems > 0
            ? `${totalDeliverItems} items across ${order.bums.filter(b => b.items.some(i => i.deliver)).length} BUM groups ready for delivery`
            : "No delivery items selected"}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/orders/${orderId}`)}
            className="px-4 py-2 border border-gray-300 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            disabled={totalDeliverItems === 0}
            className={`px-5 py-2 text-white text-sm font-semibold rounded-lg transition-colors ${
              totalDeliverItems > 0
                ? "bg-amber-400 hover:bg-amber-500"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Confirm Delivery ({totalDeliverItems})
          </button>
        </div>
      </div>
    </div>
  );
}
