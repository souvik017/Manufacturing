import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setOrderDetail,
  updateOrderField,
  addRemark,
  removeRemark,
  updateItemQty,
  toggleItemDeliver,
  toggleBumAllDeliver,
} from "../redux/Slices/orderSlice";
import useOrders from "../hooks/useOrders";
import StatusBadge from "../components/StatusBadge";
import {
  X, Plus, Settings, Eye, Paperclip, Copy, Printer,
  Mail, CheckCircle2, XCircle, Check,
  MoreHorizontal, Search, ChevronDown, ChevronRight,
} from "lucide-react";

function PersonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
}

// ─── BUM multi-select dropdown ────────────────────────────────────────────────
function BumDropdown({ bums, selectedIds, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = bums.filter(
    (b) => !search.trim() || b.bom_name?.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) =>
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((s) => s !== id)
        : [...selectedIds, id]
    );

  const selectedBums = bums.filter((b) => selectedIds.includes(b.bom_id));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 min-w-[220px] max-w-xs border border-gray-300 rounded px-3 py-1.5 bg-white hover:border-[#017e84] transition-colors text-left"
      >
        {selectedIds.length === 0 ? (
          <span className="text-xs text-gray-400 flex-1">Select BOM group(s)…</span>
        ) : (
          <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
            {selectedBums.slice(0, 3).map((b) => (
              <span key={b.bom_id} className="inline-flex items-center gap-1 bg-[#e8f5f5] text-[#017e84] text-xs font-semibold px-2 py-0.5 rounded">
                {b.bom_name}
                <button onClick={(e) => { e.stopPropagation(); toggle(b.bom_id); }} className="hover:text-red-500 leading-none">
                  <X size={9} />
                </button>
              </span>
            ))}
            {selectedIds.length > 3 && <span className="text-xs text-gray-400">+{selectedIds.length - 3}</span>}
          </div>
        )}
        <div className="flex items-center gap-1 flex-shrink-0">
          {selectedIds.length > 0 && (
            <span className="text-xs bg-[#017e84] text-white font-bold px-1.5 py-0.5 rounded-full leading-none">
              {selectedIds.length}
            </span>
          )}
          <ChevronDown size={13} className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="absolute z-40 left-0 top-full mt-1 w-80 bg-white border border-gray-200 rounded shadow-xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
            <Search size={12} className="text-gray-400 flex-shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search BOM groups…"
              className="flex-1 text-xs bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
                <X size={11} />
              </button>
            )}
            <div className="border-l border-gray-200 pl-2 flex items-center gap-2">
              <button onClick={() => onChange(bums.map((b) => b.bom_id))} className="text-xs text-[#017e84] hover:underline font-medium">All</button>
              <button onClick={() => onChange([])} className="text-xs text-gray-400 hover:text-gray-600 font-medium">Clear</button>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 && <p className="text-xs text-gray-400 px-4 py-4 text-center">No results</p>}
            {filtered.map((bum) => {
              const isSel = selectedIds.includes(bum.bom_id);
              const deliverCnt = (bum.items || []).filter((i) => i.deliver).length;
              return (
                <button
                  key={bum.bom_id}
                  onClick={() => toggle(bum.bom_id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 border-b border-gray-100 last:border-0 text-left transition-colors hover:bg-gray-50 ${isSel ? "bg-[#f0fafa]" : ""}`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${isSel ? "bg-[#017e84] border-[#017e84]" : "border-gray-300 bg-white"}`}>
                    {isSel && <Check size={9} strokeWidth={3} className="text-white" />}
                  </div>
                  <div className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 ${isSel ? "bg-[#017e84] text-white" : "bg-gray-100 text-gray-600"}`}>
                    {bum.bom_name?.charAt(0)?.toUpperCase() || "B"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{bum.bom_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{(bum.items || []).length} items</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <StatusBadge status={bum.status} />
                    {deliverCnt > 0 && <span className="text-xs text-green-600 font-medium">{deliverCnt}✓</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedIds.length > 0 && (
            <div className="px-3 py-2 bg-[#f0fafa] border-t border-[#c8e6e8] flex items-center justify-between">
              <p className="text-xs text-[#017e84] font-medium">{selectedIds.length} group{selectedIds.length > 1 ? "s" : ""} selected</p>
              <button onClick={() => setOpen(false)} className="text-xs text-[#017e84] font-semibold hover:underline">Done</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Item row ─────────────────────────────────────────────────────────────────
function ItemRow({ item, bomId, isSplit = false, itemIndex }) {
  const dispatch = useDispatch();
  const [inputVal, setInputVal] = useState(String(item.qty));

  // Keep local input in sync when Redux state changes
  useEffect(() => { 
    setInputVal(String(item.qty)); 
  }, [item.qty]);

  const handleBlur = () => {
    const n = parseFloat(inputVal);
    if (!isNaN(n) && n >= 0 && n !== item.qty) {
      dispatch(updateItemQty({ bomId, itemIndex, qty: n }));
    } else {
      setInputVal(String(item.qty));
    }
  };

  const handleToggleDeliver = () => {
    console.log("🎯 Toggle deliver clicked for:", { 
      product_name: item.product_name, 
      product_id: item.product_id,
      bomId, 
      itemIndex,
      currentDeliver: item.deliver 
    });
    
    // Dispatch with both ID and index for maximum compatibility
    dispatch(toggleItemDeliver({ 
      bomId, 
      itemId: item.product_id,
      itemIndex 
    }));
  };

  return (
    <tr className={`border-b border-gray-100 group transition-colors ${item.deliver ? "bg-green-50" : isSplit ? "bg-orange-50/40" : "hover:bg-gray-50"}`}>
      <td className="pl-10 pr-2 py-2 w-10">
        <div className={`w-8 h-8 rounded border flex items-center justify-center flex-shrink-0 ${isSplit ? "border-orange-200 bg-orange-50" : "border-gray-200 bg-gray-50"}`}>
          {isSplit ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8">
              <path d="M16 3h5v5M8 21H3v-5M21 3l-7 7M3 21l7-7"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
            </svg>
          )}
        </div>
        </td>
      <td className="px-2 py-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-900 leading-tight">{item.product_name}</p>
            {item.article_no && item.article_no !== item.product_name && (
              <p className="text-xs text-gray-500 leading-tight mt-0.5 truncate max-w-md">{item.article_no}</p>
            )}
          </div>
          {isSplit && (
            <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-600 whitespace-nowrap flex-shrink-0">
              remaining
            </span>
          )}
        </div>
        </td>
      <td className="px-3 py-2 w-24 text-right">
        <input
          type="number"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
          className="w-16 text-right text-sm text-gray-800 border-0 focus:outline-none focus:ring-1 focus:ring-[#017e84] rounded px-1 py-0.5 bg-transparent hover:bg-gray-100"
          min="0" step="0.5"
        />
        </td>
      <td className="px-3 py-2 w-16 text-xs text-gray-500 font-medium">{item.uom_name}</td>
      <td className="px-3 py-2 w-40 text-right">
        <StatusBadge status={item.status} />
        </td>
      <td className="px-3 py-2 w-12 text-center">
        <button
          onClick={handleToggleDeliver}
          className={`w-5 h-5 flex items-center justify-center mx-auto transition-colors rounded ${
            item.deliver
              ? "text-green-600 bg-green-100"
              : "text-gray-300 hover:text-gray-500 hover:bg-gray-100"
          }`}
        >
          <Check size={14} strokeWidth={item.deliver ? 2.5 : 1.5} />
        </button>
        </td>
      <td className="px-2 py-2 w-8 text-right opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={14} /></button>
        </td>
    </tr>
  );
}

// ─── BUM section ──────────────────────────────────────────────────────────────
function BumSection({ bum }) {
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);

  const items = bum.items || [];
  const deliverCnt = items.filter((i) => i.deliver).length;
  const allDelivering = items.length > 0 && items.every((i) => i.deliver);

  const handleToggleAll = () => {
    console.log("🎯 Toggle all clicked for BOM:", bum.bom_name);
    dispatch(toggleBumAllDeliver({ bomId: bum.bom_id }));
  };

  return (
    <>
      <tr className={`border-b border-gray-200 ${bum.status === "BLOCKED" ? "bg-[#fff5f5]" : bum.status === "START" ? "bg-[#f0f9f9]" : "bg-white"}`}>
        <td colSpan={7} className="py-0">
          <div className={`flex items-center gap-3 px-4 py-2.5 border-l-4 ${bum.status === "BLOCKED" ? "border-l-[#e04c4c]" : bum.status === "START" ? "border-l-[#017e84]" : "border-l-gray-200"}`}>
            <button onClick={() => setCollapsed((p) => !p)} className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
              {collapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
            </button>
            <div className="w-9 h-9 rounded border border-gray-200 bg-white flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 leading-tight">{bum.bom_name}</p>
              {collapsed && (
                <p className="text-xs text-gray-400 leading-tight">
                  {items.length} items hidden
                  {deliverCnt > 0 && <span className="text-green-600 ml-1">{deliverCnt}✓</span>}
                </p>
              )}
            </div>
            {deliverCnt > 0 && !collapsed && (
              <span className="text-xs text-green-600 font-semibold bg-green-100 px-2 py-0.5 rounded-full">
                {deliverCnt}/{items.length} ✓
              </span>
            )}
            <StatusBadge status={bum.status} />
            <button
              onClick={handleToggleAll}
              className={`text-xs px-2.5 py-1 rounded border font-medium ml-2 transition-colors ${
                allDelivering ? "bg-green-500 text-white border-green-500" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {allDelivering ? "✓ All" : "Select all"}
            </button>
            <button className="text-gray-300 hover:text-gray-500 ml-1"><MoreHorizontal size={15} /></button>
          </div>
        </td>
      </tr>
      {!collapsed && items.map((item, idx) => (
        <ItemRow
          key={`${bum.bom_id}-${item.product_id ?? idx}`}
          item={item}
          bomId={bum.bom_id}
          itemIndex={idx}
        />
      ))}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getOrderById, loading } = useOrders();

  const order = useSelector((s) => s.orders?.orderDetail);

  const [addingRemark, setAddingRemark] = useState(false);
  const [remarkText, setRemarkText] = useState("");
  const [showRawMaterials, setShowRawMaterials] = useState(false);
  const [selectedbomIds, setSelectedbomIds] = useState([]);
  const [projectNo, setProjectNo] = useState("");

  const fetchOrder = useCallback(async () => {
    const res = await getOrderById(orderId);
    if (res?.success) {
      dispatch(setOrderDetail(res.data));
      setProjectNo(res.data?.project_id || "");
      setSelectedbomIds((res.data?.boms || []).map((b) => b.bom_id));
    }
  }, [orderId, dispatch, getOrderById]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    if (order && selectedbomIds.length === 0 && order.boms) {
      setSelectedbomIds(order.boms.map((b) => b.bom_id));
    }
  }, [order]);

  const handleAddRemark = () => {
    if (!remarkText.trim()) return;
    dispatch(addRemark({ text: remarkText.trim() }));
    setRemarkText("");
    setAddingRemark(false);
  };

  const handleRemoveRemark = (index) => {
    dispatch(removeRemark({ index }));
  };

  if (loading && !order) {
    return <div className="p-8 text-gray-400 text-sm">Loading order…</div>;
  }

  if (!order) {
    return <div className="p-8 text-gray-400 text-sm">Order not found</div>;
  }

  const boms = order.boms || [];
  const visibleBums = boms.filter((b) => selectedbomIds.includes(b.bom_id));

  const totalDeliverCount = boms.reduce(
    (acc, bum) => acc + (bum.items || []).filter((i) => i.deliver).length,
    0
  );

  const requisitionNo = order.requisition_no || `REQ-${order.id}`;
  const requisitionDate = order.requisition_date || new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Top action bar */}
      <div className="bg-white border-b border-gray-200 px-2 sm:px-4 py-1.5 flex items-center gap-0.5 flex-shrink-0 overflow-x-auto">
        <button className="flex items-center gap-1.5 text-xs text-[#e04c4c] hover:bg-red-50 px-2.5 py-1.5 rounded transition-colors whitespace-nowrap">
          <XCircle size={13} /> Cancel order
        </button>
        <div className="w-px h-4 bg-gray-200 mx-0.5 flex-shrink-0" />
        <button className="flex items-center gap-1.5 text-xs text-gray-600 hover:bg-gray-100 px-2.5 py-1.5 rounded transition-colors whitespace-nowrap">
          <Paperclip size={13} /> Attachments
        </button>
        <button className="flex items-center gap-1.5 text-xs text-gray-600 hover:bg-gray-100 px-2.5 py-1.5 rounded transition-colors whitespace-nowrap">
          <Copy size={13} /> Copy
        </button>
        <button className="flex items-center gap-1.5 text-xs text-gray-600 hover:bg-gray-100 px-2.5 py-1.5 rounded transition-colors whitespace-nowrap">
          <Printer size={13} /> Print <ChevronDown size={10} className="text-gray-400" />
        </button>
        <button className="flex items-center gap-1.5 text-xs text-gray-600 hover:bg-gray-100 px-2.5 py-1.5 rounded transition-colors whitespace-nowrap">
          <Mail size={13} /> Email <ChevronDown size={10} className="text-gray-400" />
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium pr-2 whitespace-nowrap">
          <CheckCircle2 size={16} className="text-green-500" /> Saved
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* Order header */}
        <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-gray-200">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded border border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0">
              <span className="text-base sm:text-lg font-bold text-gray-400">
                {order.requisition_no?.slice(-4) || "MRN"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="mb-1"><StatusBadge status={order.status} /></div>
              <p className="text-[#017e84] font-semibold text-sm cursor-pointer hover:underline">{order.id}</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900 leading-snug mt-0.5">{order.requisition_no}</p>
              <p className="text-xs text-gray-500 mt-0.5">{order.project_name}</p>
              <button className="text-xs text-[#017e84] mt-2 hover:underline">+ Set put away location</button>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0 text-right">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <PersonIcon /><span className="hidden sm:inline">Assigned to</span>
              </div>
              <button className="px-2 sm:px-3 py-1 border border-gray-300 rounded-full text-xs text-gray-600 hover:bg-gray-50 whitespace-nowrap">
                Not prioritized ☆
              </button>
            </div>
          </div>

          {/* Requisition fields */}
          <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-4">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Requisition No</p>
              <p className="text-sm text-gray-500 italic">{requisitionNo}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Requisition Date</p>
              <p className="text-sm text-gray-700">{requisitionDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Project No</p>
              <div className="flex items-center gap-1 group cursor-pointer">
                <input
                  type="text"
                  value={projectNo}
                  onChange={(e) => {
                    setProjectNo(e.target.value);
                    dispatch(updateOrderField({ field: "project_id", value: e.target.value }));
                  }}
                  placeholder="Select project…"
                  className="text-sm text-gray-800 bg-transparent focus:outline-none w-full placeholder-gray-300 border-b border-transparent focus:border-[#017e84] hover:border-gray-300 transition-colors pb-0.5"
                />
                <ChevronDown size={12} className="text-gray-300 flex-shrink-0 group-hover:text-gray-500 transition-colors" />
              </div>
            </div>
          </div>

          <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mt-3">
            <Settings size={12} /> Manage
          </button>
        </div>

        {/* Remarks + BOM selector */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <div className="flex-1 min-w-0 w-full">
              <p className="text-sm font-semibold text-gray-800 mb-2">Remarks</p>
              <div className="flex items-center gap-2 flex-wrap">
                {(order.remarks || []).map((r, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded px-2.5 py-1 text-xs text-gray-700">
                    <span>{typeof r === 'string' ? r : r.text}</span>
                    <button onClick={() => handleRemoveRemark(i)} className="text-gray-300 hover:text-red-400">
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {addingRemark ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <input
                      autoFocus
                      value={remarkText}
                      onChange={(e) => setRemarkText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddRemark()}
                      placeholder="Type remark…"
                      className="text-xs border border-gray-300 rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#017e84] w-44"
                    />
                    <button onClick={handleAddRemark} className="text-xs bg-[#017e84] text-white px-2.5 py-1 rounded hover:bg-[#015f64]">Add</button>
                    <button onClick={() => { setAddingRemark(false); setRemarkText(""); }} className="text-gray-400 hover:text-gray-600"><X size={13} /></button>
                  </div>
                ) : (
                  <button onClick={() => setAddingRemark(true)} className="flex items-center gap-1 text-xs text-[#017e84] hover:underline">
                    <Plus size={12} /> Add remarks
                  </button>
                )}
              </div>
            </div>

            <div className="hidden sm:block w-px self-stretch bg-gray-200 flex-shrink-0" />

            <div className="flex-shrink-0 w-full sm:w-[20vw]">
              <p className="text-sm font-semibold text-gray-800 mb-2">Component Group (BOM)</p>
              <BumDropdown bums={boms} selectedIds={selectedbomIds} onChange={setSelectedbomIds} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4">
            <button
              onClick={() => navigate(`/orders/${order.id}/pickup`)}
              className="flex items-center gap-1.5 text-sm text-[#017e84] hover:underline"
            >
              <Eye size={14} /> View full pick list
              {totalDeliverCount > 0 && (
                <span className="ml-1 text-xs bg-[#017e84] text-white font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {totalDeliverCount}
                </span>
              )}
            </button>
            <button className="w-full sm:w-auto px-5 py-2 bg-[#e8a825] hover:bg-[#d4971f] text-white font-semibold text-sm rounded transition-colors">
              Complete order
            </button>
          </div>
        </div>

        {/* Overview section */}
        <div className="px-4 sm:px-6 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-base font-semibold text-gray-800">Overview</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Show raw materials</span>
              <button
                onClick={() => setShowRawMaterials((p) => !p)}
                className={`relative inline-flex w-9 h-5 rounded-full transition-colors ${showRawMaterials ? "bg-[#017e84]" : "bg-gray-200"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${showRawMaterials ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded overflow-hidden overflow-x-auto">
            {visibleBums.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 select-none">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" className="mb-3">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                </svg>
                <p className="text-sm text-gray-500 text-center px-4">Select a component group to view its items</p>
                <p className="text-xs text-gray-400 mt-1 text-center px-4">
                  Use the <span className="font-medium text-gray-500">Component Group (BOM)</span> dropdown above
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="w-10 pl-10 pr-2 py-2" />
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Component</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Qty</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-16">Unit</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide w-40">Status</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-12">Deliver</th>
                    <th className="w-8" />
                   </tr>
                </thead>
                <tbody>
                  {visibleBums.map((bum) => (
                    <BumSection key={bum.bom_id} bum={bum} />
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <button className="flex items-center gap-1 text-xs text-[#017e84] hover:underline mt-3 mb-6">
            <Plus size={12} /> Add another finished product
          </button>
        </div>
      </div>
    </div>
  );
}