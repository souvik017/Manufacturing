import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateDraftOrder } from "../redux/Slices/orderSlice";
import StatusBadge from "../components/StatusBadge";
import {
  ArrowLeft, Search, Printer, Download,
  Check, X, ChevronDown, ChevronRight, Package,
} from "lucide-react";

export default function PickupListPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 🔹 Read the draft order from Redux (created in OrderAddPage)
  const draftOrder = useSelector((s) => s.orders?.draftOrder);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState({});
  const [showAll, setShowAll] = useState(false); // false = only delivery items

  // No need for orderId – always use the draft
  const order = draftOrder;

  // If no draft exists yet, show a helpful empty state
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <Package size={24} className="text-gray-300" />
        </div>
        <p className="text-sm font-medium text-gray-500">No draft order found</p>
        <p className="text-xs text-gray-400 mt-1">Create a requisition first and save it as a draft</p>
        <button
          onClick={() => navigate("/requisitions/add")}
          className="mt-4 text-xs text-[#017e84] hover:underline"
        >
          ← Go to New Requisition
        </button>
      </div>
    );
  }

  const boms = order.boms || [];

  const isGroupOpen = (bomId) => expanded[bomId] !== false;

  // 🔹 Update item qty in draft
  const handleQtyChange = (bomId, itemIndex, val) => {
    const n = parseFloat(val);
    if (isNaN(n) || n < 0) return;

    const updatedBoms = boms.map((bom) => {
      if (String(bom.bom_id) !== String(bomId)) return bom;
      return {
        ...bom,
        items: bom.items.map((item, idx) =>
          idx === itemIndex ? { ...item, qty: n } : item
        ),
      };
    });

    dispatch(
      updateDraftOrder({
        ...order,
        boms: updatedBoms,
      })
    );
  };

  // 🔹 Toggle item delivery status in draft
  const handleToggleDeliver = (bomId, itemIndex) => {
    const updatedBoms = boms.map((bom) => {
      if (String(bom.bom_id) !== String(bomId)) return bom;
      return {
        ...bom,
        items: bom.items.map((item, idx) =>
          idx === itemIndex ? { ...item, deliver: !item.deliver } : item
        ),
      };
    });

    dispatch(
      updateDraftOrder({
        ...order,
        boms: updatedBoms,
      })
    );
  };

  // 🔹 Toggle all items in a BOM
  const handleToggleBumAll = (bomId) => {
    const updatedBoms = boms.map((bom) => {
      if (String(bom.bom_id) !== String(bomId)) return bom;
      const allDelivering = bom.items.every((i) => i.deliver);
      const newStatus = !allDelivering;
      return {
        ...bom,
        items: bom.items.map((item) => ({ ...item, deliver: newStatus })),
      };
    });

    dispatch(
      updateDraftOrder({
        ...order,
        boms: updatedBoms,
      })
    );
  };

  const toggleGroup = (bomId) =>
    setExpanded((prev) => ({ ...prev, [bomId]: !isGroupOpen(bomId) }));

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
          onClick={() => navigate("/requisitions/add")} // Go back to orders list
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#017e84]"
        >
          <ArrowLeft size={13} /> Back
        </button>
        <div className="w-px h-4 bg-gray-200" />
        <span className="text-xs text-[#017e84] font-medium">{order.requisition_no}</span>
        <span className="text-gray-300 text-xs">/</span>
        <span className="text-xs font-semibold text-gray-700">Pick List</span>
        <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full ml-2">
          DRAFT
        </span>
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
            {totalDeliverItems > 0 ? (
              <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                {totalDeliverItems} item{totalDeliverItems !== 1 ? "s" : ""} marked for delivery
              </span>
            ) : (
              <span className="text-xs text-gray-400">No items marked yet</span>
            )}
            {/* <button
              onClick={() => setShowAll((p) => !p)}
              className={`text-xs px-3 py-1.5 rounded border font-medium transition-colors ${
                showAll
                  ? "bg-[#2c2c2c] text-white border-[#2c2c2c]"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {showAll ? "Delivery only ✓" : "Show all items"}
            </button> */}
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
        {/* <div className="flex gap-1 flex-wrap">
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
        </div> */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!showAll && totalDeliverItems === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Package size={24} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No items selected for delivery</p>
            <p className="text-xs text-gray-400 mt-1">Go to the order detail and mark items to deliver</p>
            <button
              onClick={() => navigate("/requisitions/add")}
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
                const visibleIndices = (bum.items || []).reduce((indices, item, idx) => {
                  if (isItemVisible(item)) indices.push(idx);
                  return indices;
                }, []);

                if (visibleIndices.length === 0) return null;

                const isOpen = isGroupOpen(bum.bom_id);
                const bumAllDelivering = (bum.items || []).length > 0 && (bum.items || []).every((i) => i.deliver);

                return (
                  <React.Fragment key={bum.bom_id}>
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
                              {(bum.items || []).filter((i) => i.deliver).length > 0 && (
                                <span className="text-green-600 ml-1 font-medium">
                                  · {(bum.items || []).filter((i) => i.deliver).length}✓
                                </span>
                              )}
                            </p>
                          </div>
                          <StatusBadge status={bum.status} />
                          {/* <button
                            onClick={(e) => { e.stopPropagation(); handleToggleBumAll(bum.bom_id); }}
                            className={`text-xs px-2.5 py-1 rounded border font-medium ml-2 transition-colors ${
                              bumAllDelivering
                                ? "bg-green-500 text-white border-green-500"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            {bumAllDelivering ? "✓ All" : "Select all"}
                          </button> */}
                        </div>
                      </td>
                    </tr>

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