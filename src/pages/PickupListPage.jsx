import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setOrderDetail,
  updateItemQty,
  toggleItemDeliver,
  toggleBumAllDeliver,
} from "../redux/Slices/orderSlice";
import useOrders from "../hooks/useOrders";
import StatusBadge from "../components/StatusBadge";
import {
  ArrowLeft, Search, Printer, Download,
  Check, X, ChevronDown, ChevronRight, Package,
} from "lucide-react";

export default function PickupListPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getOrderById } = useOrders();

  // ✅ FIX: Read live from Redux — changes made in OrderDetailPage are instantly visible here
  const order = useSelector((s) => s.orders?.orderDetail);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState({});
  const [showAll, setShowAll] = useState(false); // false = only delivery items

  // ✅ FIX: Only fetch from server if the Redux store has a different order (or nothing)
  useEffect(() => {
    if (!order || String(order.id) !== String(orderId)) {
      getOrderById(orderId).then((res) => {
        if (res?.success) dispatch(setOrderDetail(res.data));
      });
    }
  }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps
  // Note: intentionally only re-run when orderId changes, NOT when order changes,
  // so that Redux mutations from OrderDetailPage are preserved.

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <Package size={24} className="text-gray-300" />
        </div>
        <p className="text-sm font-medium text-gray-500">Loading order…</p>
      </div>
    );
  }

  const boms = order.boms || [];

  const isGroupOpen = (bumId) => expanded[bumId] !== false;

  const handleQtyChange = (bumId, itemIndex, val) => {
    const n = parseFloat(val);
    if (!isNaN(n) && n >= 0)
      dispatch(updateItemQty({ bumId, itemIndex, qty: n }));
  };

  const handleToggleDeliver = (bumId, itemIndex) =>
    dispatch(toggleItemDeliver({ bumId, itemIndex }));

  const toggleGroup = (bumId) =>
    setExpanded((prev) => ({ ...prev, [bumId]: !isGroupOpen(bumId) }));

  const handleToggleBumAll = (bumId) =>
    dispatch(toggleBumAllDeliver({ bumId }));

  // ✅ Count ALL items marked for delivery across every BOM
  const totalDeliverItems = boms.reduce(
    (acc, bum) => acc + (bum.items || []).filter((i) => i.deliver).length,
    0
  );

  const filters = ["All", "Not Enough", "Waiting", "Blocked", "Available"];

  const matchesStatusFilter = (item) => {
    if (filter === "All") return true;
    if (filter === "Blocked") return item.status === "BLOCKED";
    if (filter === "Not Enough") return item.status === "NOT ENOUGH";
    if (filter === "Waiting") return item.status === "WAITING";
    if (filter === "Available") return !item.status || item.status === "ok";
    return true;
  };

  const matchesSearch = (item) =>
    !search.trim() ||
    (item.product_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (item.article_no || "").toLowerCase().includes(search.toLowerCase());

  // ✅ FIX: isItemVisible correctly gates on deliver flag when showAll is false
  const isItemVisible = (item) => {
    if (!matchesStatusFilter(item)) return false;
    if (!matchesSearch(item)) return false;
    if (!showAll && !item.deliver) return false;
    return true;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => navigate(`/orders/${orderId}`)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#017e84]"
        >
          <ArrowLeft size={13} /> Back
        </button>
        <div className="w-px h-4 bg-gray-200" />
        <span className="text-xs text-[#017e84] font-medium">{order.requisition_no}</span>
        <span className="text-gray-300 text-xs">/</span>
        <span className="text-xs font-semibold text-gray-700">Pick List</span>
        <div className="flex-1" />
        <button className="flex items-center gap-1.5 text-xs text-gray-600 hover:bg-gray-100 px-2.5 py-1.5 rounded border border-gray-200">
          <Printer size={12} /> Print
        </button>
        <button className="flex items-center gap-1.5 text-xs text-gray-600 hover:bg-gray-100 px-2.5 py-1.5 rounded border border-gray-200">
          <Download size={12} /> Export
        </button>
      </div>

      {/* Summary header */}
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-semibold text-gray-900">
              Pick List — {order.requisition_no}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{order.project_name}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* ✅ FIX: This count is always live from Redux */}
            {totalDeliverItems > 0 ? (
              <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                {totalDeliverItems} item{totalDeliverItems !== 1 ? "s" : ""} marked for delivery
              </span>
            ) : (
              <span className="text-xs text-gray-400">No items marked yet</span>
            )}
            <button
              onClick={() => setShowAll((p) => !p)}
              className={`text-xs px-3 py-1.5 rounded border font-medium transition-colors ${
                showAll
                  ? "bg-[#2c2c2c] text-white border-[#2c2c2c]"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {showAll ? "Delivery only ✓" : "Show all items"}
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-white flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-1.5 border border-gray-200 rounded px-2.5 py-1.5 bg-white min-w-[180px]">
          <Search size={12} className="text-gray-400 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items…"
            className="flex-1 text-xs bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X size={11} className="text-gray-400" />
            </button>
          )}
        </div>
        <div className="flex gap-1 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                filter === f
                  ? "bg-[#2c2c2c] text-white border-[#2c2c2c]"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!showAll && totalDeliverItems === 0 ? (
          /* ✅ Empty state: no items marked for delivery */
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Package size={24} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No items selected for delivery</p>
            <p className="text-xs text-gray-400 mt-1">Go to the order detail and tick items to deliver</p>
            <button
              onClick={() => navigate(`/orders/${orderId}`)}
              className="mt-4 text-xs text-[#017e84] hover:underline"
            >
              ← Back to order
            </button>
          </div>
        ) : (
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <th className="w-12 px-4 py-2.5" />
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Component</th>
                <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Qty</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-16">Unit</th>
                <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">Status</th>
                <th className="w-12 px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Deliver</th>
              </tr>
            </thead>
            <tbody>
              {boms.map((bum) => {
                // Determine which items are visible in this BOM (preserving original indices)
                const visibleIndices = (bum.items || []).reduce((indices, item, idx) => {
                  if (isItemVisible(item)) indices.push(idx);
                  return indices;
                }, []);

                // ✅ FIX: Skip entire BOM section if no items match the current filters
                if (visibleIndices.length === 0) return null;

                const isOpen = isGroupOpen(bum.bom_id);
                // ✅ FIX: "Select all" checks ALL items in the BOM, not just visible ones
                const bumAllDelivering = (bum.items || []).length > 0 && (bum.items || []).every((i) => i.deliver);

                return (
                  <React.Fragment key={bum.bom_id}>
                    {/* BOM header row */}
                    <tr
                      className={`border-b border-gray-200 cursor-pointer ${
                        bum.status === "BLOCKED" ? "bg-[#fff5f5]" : "bg-gray-50"
                      }`}
                      onClick={() => toggleGroup(bum.bom_id)}
                    >
                      <td colSpan={6} className="py-0">
                        <div className={`flex items-center gap-3 px-4 py-2.5 border-l-4 ${
                          bum.status === "BLOCKED" ? "border-l-[#e04c4c]"
                          : bum.status === "START" ? "border-l-[#017e84]"
                          : "border-l-gray-200"
                        }`}>
                          {isOpen
                            ? <ChevronDown size={13} className="text-gray-400" />
                            : <ChevronRight size={13} className="text-gray-400" />
                          }
                          <div className="w-8 h-8 rounded border border-gray-200 bg-white flex items-center justify-center flex-shrink-0">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900">{bum.bom_name}</p>
                            <p className="text-xs text-gray-500">
                              {visibleIndices.length} item{visibleIndices.length !== 1 ? "s" : ""}
                              {/* ✅ Show deliver count for this BOM */}
                              {(bum.items || []).filter((i) => i.deliver).length > 0 && (
                                <span className="text-green-600 ml-1 font-medium">
                                  · {(bum.items || []).filter((i) => i.deliver).length}✓
                                </span>
                              )}
                            </p>
                          </div>
                          <StatusBadge status={bum.status} />
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleBumAll(bum.bom_id); }}
                            className={`text-xs px-2.5 py-1 rounded border font-medium ml-2 transition-colors ${
                              bumAllDelivering
                                ? "bg-green-500 text-white border-green-500"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            {bumAllDelivering ? "✓ All" : "Select all"}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Item rows — only render visible items, using original index for dispatch */}
                    {isOpen && (bum.items || []).map((item, idx) => {
                      if (!isItemVisible(item)) return null;
                      return (
                        <tr
                          key={`${bum.bom_id}-${idx}`}
                          className={`border-b border-gray-100 group hover:bg-gray-50 transition-colors ${
                            item.deliver ? "bg-green-50" : ""
                          }`}
                        >
                          <td className="pl-10 pr-2 py-2 w-12">
                            <div className="w-7 h-7 rounded border border-gray-200 bg-gray-50 flex items-center justify-center mx-auto">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                              </svg>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <p className="text-xs font-semibold text-gray-900">{item.product_name}</p>
                            {item.article_no && item.article_no !== item.product_name && (
                              <p className="text-xs text-gray-500 mt-0.5 truncate max-w-md">{item.article_no}</p>
                            )}
                          </td>
                          <td className="px-3 py-2 w-24 text-right">
                            {/* ✅ FIX: Use controlled input with item.qty from Redux */}
                            <input
                              type="number"
                              value={item.qty}
                              onChange={(e) => handleQtyChange(bum.bom_id, idx, e.target.value)}
                              className="w-16 text-right text-sm text-gray-800 border-0 focus:outline-none focus:ring-1 focus:ring-[#017e84] rounded px-1 py-0.5 bg-transparent hover:bg-gray-100"
                              min="0" step="0.5"
                            />
                          </td>
                          <td className="px-3 py-2 w-16 text-xs text-gray-500">{item.uom_name}</td>
                          <td className="px-3 py-2 w-36 text-right">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="px-3 py-2 w-12 text-center">
                            {/* ✅ FIX: Deliver button uses original idx for correct Redux update */}
                            <button
                              onClick={() => handleToggleDeliver(bum.bom_id, idx)}
                              className={`w-5 h-5 flex items-center justify-center mx-auto rounded transition-colors ${
                                item.deliver
                                  ? "text-green-600 bg-green-100"
                                  : "text-gray-300 hover:text-gray-500 hover:bg-gray-100"
                              }`}
                            >
                              <Check size={14} strokeWidth={item.deliver ? 2.5 : 1.5} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}