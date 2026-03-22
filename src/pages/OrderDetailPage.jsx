import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import StatusBadge from "../components/StatusBadge";
import {
  ChevronDown, ChevronRight, X, Plus, Settings, Eye,
  Paperclip, Copy, Printer, Mail, CheckCircle2, XCircle,
  ArrowRight, Check, ChevronUp, MoreHorizontal, Search,
  Package, SlidersHorizontal,
} from "lucide-react";

// ── Multi-select BUM Dropdown ─────────────────────────────────────────────────
function BumDropdown({ bums, selectedIds, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const filtered = bums.filter(
    (b) =>
      !search.trim() ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) =>
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((s) => s !== id)
        : [...selectedIds, id]
    );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedBums = bums.filter((b) => selectedIds.includes(b.id));

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between border border-gray-300 rounded-xl px-3 py-2 bg-white hover:border-violet-400 transition-colors shadow-sm"
      >
        {selectedIds.length === 0 ? (
          <span className="text-xs text-gray-400">Select BUM group(s)…</span>
        ) : (
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            {selectedBums.slice(0, 4).map((b) => (
              <span key={b.id} className="inline-flex items-center gap-1 bg-violet-100 text-violet-700 text-xs font-semibold px-2 py-0.5 rounded-md">
                {b.code}
                <button
                  onClick={(e) => { e.stopPropagation(); toggle(b.id); }}
                  className="hover:text-red-500 leading-none"
                >
                  <X size={9} />
                </button>
              </span>
            ))}
            {selectedIds.length > 4 && (
              <span className="text-xs text-gray-400">+{selectedIds.length - 4}</span>
            )}
          </div>
        )}
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {selectedIds.length > 0 && (
            <span className="text-xs bg-violet-600 text-white font-bold px-1.5 py-0.5 rounded-full leading-none">
              {selectedIds.length}
            </span>
          )}
          <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-30 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
          {/* Search + All/Clear */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-gray-50">
            <Search size={12} className="text-gray-400 flex-shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search BUM groups…"
              className="flex-1 text-xs bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
                <X size={11} />
              </button>
            )}
            <div className="border-l border-gray-200 pl-2 flex items-center gap-2">
              <button onClick={() => onChange(bums.map((b) => b.id))} className="text-xs text-violet-600 hover:text-violet-800 font-medium">All</button>
              <button onClick={() => onChange([])} className="text-xs text-gray-400 hover:text-gray-600 font-medium">Clear</button>
            </div>
          </div>

          {/* Options */}
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-xs text-gray-400 px-4 py-4 text-center">No groups match "{search}"</p>
            )}
            {filtered.map((bum) => {
              const isSel = selectedIds.includes(bum.id);
              const deliverCnt = bum.items.filter((i) => i.deliver).length;
              return (
                <button
                  key={bum.id}
                  onClick={() => toggle(bum.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 last:border-0 text-left transition-colors hover:bg-gray-50 ${isSel ? "bg-violet-50" : ""}`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${isSel ? "bg-violet-600 border-violet-600" : "border-gray-300 bg-white"}`}>
                    {isSel && <Check size={9} strokeWidth={3} className="text-white" />}
                  </div>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${isSel ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-700"}`}>
                    {bum.code || "—"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{bum.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{bum.sub} · {bum.items.length} items</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <StatusBadge status={bum.status} />
                    {deliverCnt > 0 && <span className="text-xs text-green-600 font-medium">{deliverCnt} ✓</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedIds.length > 0 && (
            <div className="px-4 py-2 bg-violet-50 border-t border-violet-100 flex items-center justify-between">
              <p className="text-xs text-violet-700 font-medium">{selectedIds.length} group{selectedIds.length > 1 ? "s" : ""} selected</p>
              <button onClick={() => setOpen(false)} className="text-xs text-violet-600 font-semibold hover:text-violet-800">Done</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Item row ──────────────────────────────────────────────────────────────────
function ItemRow({ item, bumId, orderId, dispatch }) {
  const handleQty = (val) => {
    const n = parseFloat(val);
    if (!isNaN(n) && n >= 0)
      dispatch({ type: "UPDATE_ITEM_QTY", orderId, bumId, itemId: item.id, qty: n });
  };
  const toggleDeliver = () =>
    dispatch({ type: "TOGGLE_ITEM_DELIVER", orderId, bumId, itemId: item.id });

  return (
    <tr className={`border-b border-gray-100 transition-colors ${item.deliver ? "bg-green-50 hover:bg-green-100" : "bg-white hover:bg-gray-50"}`}>
      <td className="px-4 py-2.5 w-10">
        <button onClick={toggleDeliver}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all mx-auto ${item.deliver ? "bg-green-500 border-green-500 text-white" : "border-gray-300 hover:border-green-400 bg-white"}`}>
          {item.deliver && <Check size={10} strokeWidth={3} />}
        </button>
      </td>
      <td className="px-3 py-2.5">
        <p className="text-xs font-semibold text-gray-800">{item.name}</p>
        {item.sub && item.sub !== item.name && (
          <p className="text-xs text-gray-400 mt-0.5 max-w-sm truncate">{item.sub}</p>
        )}
      </td>
      <td className="px-3 py-2.5 w-36">
        <div className="flex items-center justify-center gap-1">
          <button onClick={() => handleQty(Math.max(0, item.qty - 1))}
            className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 flex-shrink-0">
            <ChevronDown size={11} />
          </button>
          <input type="number" value={item.qty} onChange={(e) => handleQty(e.target.value)}
            className="w-14 text-center text-sm font-bold text-gray-800 border border-gray-200 rounded-lg px-1 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            min="0" step="0.5" />
          <button onClick={() => handleQty(item.qty + 1)}
            className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 flex-shrink-0">
            <ChevronUp size={11} />
          </button>
        </div>
      </td>
      <td className="px-3 py-2.5 w-14 text-center text-xs text-gray-500 font-medium">{item.unit}</td>
      <td className="px-3 py-2.5 w-36 text-right"><StatusBadge status={item.status} /></td>
      <td className="px-3 py-2.5 w-28 text-center">
        <button onClick={toggleDeliver}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${item.deliver ? "bg-green-500 text-white hover:bg-green-600 shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"}`}>
          {item.deliver ? "✓ Deliver" : "Mark"}
        </button>
      </td>
      <td className="px-3 py-2.5 w-8 text-right">
        <button className="text-gray-300 hover:text-gray-500"><MoreHorizontal size={14} /></button>
      </td>
    </tr>
  );
}

// ── BUM Panel — one table per selected BUM ────────────────────────────────────
function BumPanel({ bum, orderId, dispatch, navigate }) {
  const [itemSearch, setItemSearch] = useState("");
  const [itemFilter, setItemFilter] = useState("All");
  const FILTERS = ["All", "Not Enough", "Waiting", "Blocked", "Available"];

  const matchFilter = (item) => {
    if (itemFilter === "All")        return true;
    if (itemFilter === "Blocked")    return item.status === "BLOCKED";
    if (itemFilter === "Not Enough") return item.status === "NOT ENOUGH";
    if (itemFilter === "Waiting")    return item.status === "WAITING";
    if (itemFilter === "Available")  return !item.status || item.status === "ok";
    return true;
  };

  const visibleItems = bum.items.filter(
    (i) => matchFilter(i) && (
      !itemSearch.trim() ||
      i.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
      (i.sub || "").toLowerCase().includes(itemSearch.toLowerCase())
    )
  );

  const allDelivering = bum.items.length > 0 && bum.items.every((i) => i.deliver);
  const toggleAll = () => dispatch({ type: "TOGGLE_BUM_ALL_DELIVER", orderId, bumId: bum.id });

  return (
    <div className={`rounded-xl border overflow-hidden mb-3 last:mb-0 ${bum.status === "BLOCKED" ? "border-red-200" : "border-gray-200"}`}>
      {/* BUM header */}
      <div className={`flex items-center gap-3 px-5 py-3 border-b ${
        bum.status === "BLOCKED" ? "bg-red-50 border-red-200 border-l-4 border-l-red-400" :
        bum.status === "START"   ? "bg-blue-50 border-blue-100 border-l-4 border-l-blue-400" :
        "bg-gray-50 border-gray-100 border-l-4 border-l-transparent"
      }`}>
        <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-700 flex-shrink-0">
          {bum.code}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800">{bum.name}</p>
          <p className="text-xs text-gray-400">{bum.sub} · {bum.items.length} items</p>
        </div>
        <StatusBadge status={bum.status} />
        <button onClick={() => navigate(`/orders/${orderId}/bum/${bum.id}`)}
          className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-800 font-medium bg-violet-50 hover:bg-violet-100 px-2.5 py-1.5 rounded-lg transition-colors ml-2">
          Full page <ArrowRight size={11} />
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 px-5 py-2.5 border-b border-gray-100 bg-white flex-wrap gap-y-2">
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 flex-1 min-w-[160px] max-w-xs">
          <Search size={12} className="text-gray-400 flex-shrink-0" />
          <input value={itemSearch} onChange={(e) => setItemSearch(e.target.value)}
            placeholder="Search items…"
            className="flex-1 text-xs bg-transparent focus:outline-none text-gray-700 placeholder-gray-400" />
          {itemSearch && <button onClick={() => setItemSearch("")} className="text-gray-400 hover:text-gray-600"><X size={11} /></button>}
        </div>
        <div className="flex gap-1 flex-wrap">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setItemFilter(f)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${itemFilter === f ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 ml-auto flex-shrink-0">
          <span className="text-xs text-gray-400">{visibleItems.length} shown</span>
          <button onClick={toggleAll}
            className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-colors border ${allDelivering ? "bg-green-500 text-white border-green-500 hover:bg-green-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>
            {allDelivering ? "✓ All selected" : "Select all"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="w-10 px-4 py-2.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">✓</th>
              <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Item</th>
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">Quantity</th>
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-14">Unit</th>
              <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">Status</th>
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">Deliver</th>
              <th className="w-8 px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item) => (
              <ItemRow key={item.id} item={item} bumId={bum.id} orderId={orderId} dispatch={dispatch} />
            ))}
            {visibleItems.length === 0 && (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                {itemSearch || itemFilter !== "All" ? "No items match your search / filter" : "No items in this group"}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {bum.items.filter((i) => i.deliver).length > 0
            ? `${bum.items.filter((i) => i.deliver).length} items from this group marked for delivery`
            : "Tick items to mark them for delivery"}
        </p>
        <button onClick={() => navigate(`/orders/${orderId}/bum/${bum.id}`)}
          className="text-xs text-violet-600 hover:text-violet-800 font-medium flex items-center gap-1">
          Open full BUM page <ArrowRight size={11} />
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate    = useNavigate();
  const { state, dispatch } = useApp();

  const order = state.orders.find((o) => o.id === orderId);

  const [location, setLocation]             = useState(order?.location || "Workshop");
  const [addingRemark, setAddingRemark]     = useState(false);
  const [remarkText, setRemarkText]         = useState("");
  const [selectedBumIds, setSelectedBumIds] = useState(order?.bums[0]?.id ? [order.bums[0].id] : []);
  const [tableOpen, setTableOpen]           = useState(true);

  if (!order) return <div className="p-8 text-gray-400">Order not found</div>;

  const allItems     = order.bums.flatMap((b) => b.items);
  const deliverCount = allItems.filter((i) => i.deliver).length;
  const totalItems   = allItems.length;
  const blockedBums  = order.bums.filter((b) => b.status === "BLOCKED").length;
  const selectedBums = order.bums.filter((b) => selectedBumIds.includes(b.id));

  const handleAddRemark = () => {
    if (remarkText.trim()) {
      dispatch({ type: "ADD_REMARK", orderId: order.id, text: remarkText.trim() });
      setRemarkText(""); setAddingRemark(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Top action bar ── */}
      <div className="bg-white border-b border-gray-200 px-5 py-2.5 flex items-center gap-3 flex-wrap flex-shrink-0">
        <span className="text-sm font-bold text-blue-600">{order.id}</span>
        <StatusBadge status={order.status} />
        <div className="flex-1" />
        <button className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700"><XCircle size={13} /> Cancel order</button>
        <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"><Paperclip size={13} /> Attachments</button>
        <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"><Copy size={13} /> Copy</button>
        <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"><Printer size={13} /> Print</button>
        <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"><Mail size={13} /> Email</button>
        <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
          <CheckCircle2 size={13} className="text-green-500" /> Saved
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">

        {/* ── Master info card ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-600 flex-shrink-0">
              {order.productCode}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-blue-600 font-semibold text-sm">{order.id}</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5 leading-tight">{order.productName}</p>
              <p className="text-xs text-gray-400 mt-1">{order.productSub}</p>
              <button className="text-xs text-blue-500 mt-2 hover:underline">+ Set put away location</button>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs">👤</div>
                Assigned to
              </div>
              <button className="px-3 py-1 border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-gray-50">Not prioritized ★</button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400 mb-1">Location</p>
              <select value={location} onChange={(e) => setLocation(e.target.value)}
                className="text-sm text-gray-800 bg-transparent border-0 p-0 focus:outline-none cursor-pointer font-medium">
                <option>Workshop</option><option>Warehouse</option>
                <option>Assembly</option><option>Production Floor</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Order date</p>
              <p className="text-sm font-medium text-gray-800">{order.orderDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Due date</p>
              <input type="date" className="text-sm text-gray-600 bg-transparent border-0 p-0 focus:outline-none cursor-pointer" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Project No</p>
              <p className="text-sm font-medium text-gray-800">{order.projectNo}</p>
            </div>
          </div>

          <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mt-3">
            <Settings size={12} /> Manage
          </button>
        </div>

        {/* ── Remarks + BUM selector side by side ── */}
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
          <div className="flex items-start gap-4">

            {/* LEFT: Remarks inline */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Remarks</p>
              <div className="flex items-center gap-2 flex-wrap">
                {order.remarks.map((r, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700">
                    <span>{r}</span>
                    <button onClick={() => dispatch({ type: "REMOVE_REMARK", orderId: order.id, index: i })}
                      className="text-gray-300 hover:text-red-400 flex-shrink-0"><X size={10} /></button>
                  </div>
                ))}
                {addingRemark ? (
                  <div className="flex items-center gap-1.5">
                    <input autoFocus value={remarkText}
                      onChange={(e) => setRemarkText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddRemark()}
                      placeholder="Type remark…"
                      className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 w-44" />
                    <button onClick={handleAddRemark} className="text-xs bg-blue-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-blue-700">Add</button>
                    <button onClick={() => { setAddingRemark(false); setRemarkText(""); }} className="text-gray-400 hover:text-gray-600"><X size={13} /></button>
                  </div>
                ) : (
                  <button onClick={() => setAddingRemark(true)}
                    className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700">
                    <Plus size={12} /> Add remarks
                  </button>
                )}
              </div>
            </div>

            {/* DIVIDER */}
            <div className="w-px self-stretch bg-gray-200 flex-shrink-0" />

            {/* RIGHT: BUM multi-select */}
            <div className="w-[30vw] flex-shrink-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Component Group (BUM)</p>
              <BumDropdown
                bums={order.bums}
                selectedIds={selectedBumIds}
                onChange={setSelectedBumIds}
              />
            </div>

          </div>
        </div>

        {/* ── Master Requisition Table ── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

          {/* Section header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-200 bg-white">
            <button
              onClick={() => setTableOpen((p) => !p)}
              className="flex items-center gap-2 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
            >
              {tableOpen
                ? <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />
                : <ChevronRight size={16} className="text-gray-500 flex-shrink-0" />}
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-800">Master Requisition Table</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {order.bums.length} BUM groups · {totalItems} total items
                </p>
              </div>
            </button>

            <div className="flex items-center gap-2 flex-shrink-0">
              {blockedBums > 0 && (
                <span className="text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-medium">
                  {blockedBums} blocked
                </span>
              )}
              {deliverCount > 0 && (
                <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                  {deliverCount} for delivery
                </span>
              )}
              <button
                onClick={() => navigate(`/orders/${order.id}/pickup`)}
                className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-800 font-medium bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Eye size={12} /> Pick-up List
              </button>
            </div>
          </div>

          {tableOpen && (
            <div className="p-4 space-y-3">
              {selectedBums.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Package size={36} className="mb-3 opacity-30" />
                  <p className="text-sm">Select one or more BUM groups from the selector above</p>
                </div>
              ) : (
                selectedBums.map((bum) => (
                  <BumPanel key={bum.id} bum={bum} orderId={orderId} dispatch={dispatch} navigate={navigate} />
                ))
              )}
            </div>
          )}

          {/* Collapsed footer strip */}
          {!tableOpen && (
            <div className="px-5 py-3 flex items-center gap-3 flex-wrap bg-gray-50">
              {order.bums.map((bum) => (
                <button
                  key={bum.id}
                  onClick={() => { setSelectedBumIds([bum.id]); setTableOpen(true); }}
                  className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-violet-600 transition-colors"
                >
                  <span className="w-5 h-5 rounded bg-gray-200 flex items-center justify-center text-xs font-bold">{bum.code}</span>
                  <span className="truncate max-w-[120px]">{bum.name.split(":")[1]?.trim() || bum.name}</span>
                  {bum.items.filter(i => i.deliver).length > 0 && (
                    <span className="text-green-600 font-bold">·{bum.items.filter(i => i.deliver).length}✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 px-1">
          <Plus size={12} /> Add another finished product
        </button>
      </div>

      {/* ── Bottom bar ── */}
      <div className="bg-white border-t border-gray-200 px-5 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/orders/${order.id}/pickup`)}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <Eye size={15} /> View Pick-up List
          </button>
          {deliverCount > 0 && (
            <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
              {deliverCount} items for delivery
            </span>
          )}
        </div>
        <button className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-white font-semibold text-sm rounded-lg transition-colors">
          Complete order
        </button>
      </div>
    </div>
  );
}