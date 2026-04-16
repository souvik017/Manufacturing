import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import StatusBadge from "../components/StatusBadge";
import { ArrowLeft, Search, X, ChevronDown, ChevronRight, Package, Eye, Check } from "lucide-react";

export default function PickupListPage() {
  const navigate = useNavigate();
  const draftOrder = useSelector((state) => state.orders?.draftOrder);

  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});

  if (!draftOrder) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <Package size={24} className="text-gray-300" />
        </div>
        <p className="text-sm font-medium text-gray-500">No draft order found</p>
        <p className="text-xs text-gray-400 mt-1">Create or edit a requisition first</p>
        <button
          onClick={() => navigate("/requisitions")}
          className="mt-4 text-xs text-[#017e84] hover:underline"
        >
          ← Go to Orders
        </button>
      </div>
    );
  }

  const boms = draftOrder.boms || [];

  const isGroupOpen = (bomId) => expanded[bomId] !== false;
  const toggleGroup = (bomId) =>
    setExpanded((prev) => ({ ...prev, [bomId]: !isGroupOpen(bomId) }));

  // Filter items that have pick_qty > 0 (marked for delivery)
  const allMarkedItems = boms.flatMap(bom =>
    (bom.items || []).filter(item => item.pick_qty > 0)
  );
  const totalMarked = allMarkedItems.length;

  const matchesSearch = (item) =>
    !search.trim() ||
    (item.product_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (item.article_no || "").toLowerCase().includes(search.toLowerCase());

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#017e84]"
        >
          <ArrowLeft size={13} /> Back
        </button>
        <div className="w-px h-4 bg-gray-200" />
        <span className="text-xs text-[#017e84] font-medium">{draftOrder.requisition_no}</span>
        <span className="text-gray-300 text-xs">/</span>
        <span className="text-xs font-semibold text-gray-700">Pickup List</span>
        <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full ml-2">
          DRAFT PREVIEW
        </span>
        <div className="flex-1" />
      </div>

      {/* Summary */}
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-semibold text-gray-900">
              Pickup List — {draftOrder.requisition_no}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{draftOrder.project_name}</p>
          </div>
          <div className="flex items-center gap-3">
            {totalMarked > 0 ? (
              <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                {totalMarked} item{totalMarked !== 1 ? "s" : ""} will be saved
              </span>
            ) : (
              <span className="text-xs text-gray-400">No items marked</span>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-white flex-shrink-0">
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
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {totalMarked === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Package size={24} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No items marked for delivery</p>
            <p className="text-xs text-gray-400 mt-1">Go back and mark items (Pick NOS should be more then 0)</p>
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
                <th className="w-12 px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Marked</th>
              </tr>
            </thead>
            <tbody>
              {boms.map((bom) => {
                const markedItems = (bom.items || []).filter(
                  (item) => item.pick_qty > 0 && matchesSearch(item)
                );
                if (markedItems.length === 0) return null;

                const isOpen = isGroupOpen(bom.bom_id);

                return (
                  <React.Fragment key={bom.bom_id}>
                    <tr
                      className="border-b border-gray-200 cursor-pointer bg-gray-50"
                      onClick={() => toggleGroup(bom.bom_id)}
                    >
                      <td colSpan={6} className="py-0">
                        <div className="flex items-center gap-3 px-4 py-2.5 border-l-4 border-l-[#017e84]">
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
                            <p className="text-xs font-bold text-gray-900">{bom.bom_name}</p>
                            <p className="text-xs text-gray-500">
                              {markedItems.length} item{markedItems.length !== 1 ? "s" : ""} marked
                            </p>
                          </div>
                          <StatusBadge status={bom.status} />
                        </div>
                      </td>
                    </tr>

                    {isOpen && markedItems.map((item, idx) => (
                      <tr key={`${bom.bom_id}-${idx}`} className="border-b border-gray-100 bg-white">
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
                        <td className="px-3 py-2 w-24 text-right text-sm text-gray-800">
                          {item.pick_qty}
                        </td>
                        <td className="px-3 py-2 w-16 text-xs text-gray-500">{item.uom_name}</td>
                        <td className="px-3 py-2 w-36 text-right">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-3 py-2 w-12 text-center">
                          <div className="w-5 h-5 flex items-center justify-center mx-auto rounded bg-green-100 text-green-600">
                            <Check size={14} strokeWidth={2.5} />
                          </div>
                        </td>
                      </tr>
                    ))}
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