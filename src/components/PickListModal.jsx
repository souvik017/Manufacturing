import { useState } from "react";
import {
  X, Search, Printer, Download, CheckCircle2,
  ChevronRight, ChevronDown, Check,
} from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function PickListModal({ order, onClose }) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [checked, setChecked] = useState({});
  const [expanded, setExpanded] = useState(() =>
    Object.fromEntries(order.components.map((c) => [c.id, true]))
  );

  const filters = ["All", "Blocked", "Not Enough", "Waiting", "Available"];

  const allItems = order.components.flatMap((c) => c.items || []);
  const pickedCount = Object.values(checked).filter(Boolean).length;
  const totalItems = allItems.length;
  const pct = totalItems ? Math.round((pickedCount / totalItems) * 100) : 0;

  const blockedGroups = order.components.filter((c) => c.status === "BLOCKED").length;
  const notEnoughCount = allItems.filter((i) => i.status === "NOT ENOUGH").length;
  const waitingCount = allItems.filter((i) => i.status === "WAITING").length;

  function matchFilter(item) {
    if (activeFilter === "All") return true;
    if (activeFilter === "Blocked") return item.status === "BLOCKED";
    if (activeFilter === "Not Enough") return item.status === "NOT ENOUGH";
    if (activeFilter === "Waiting") return item.status === "WAITING";
    if (activeFilter === "Available") return !item.status || item.status === "ok";
    return true;
  }

  function matchSearch(item) {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.sub || "").toLowerCase().includes(q)
    );
  }

  const toggleCheck = (id) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const checkAll = () => {
    const all = {};
    allItems.forEach((i) => (all[i.id] = true));
    setChecked(all);
  };
  const uncheckAll = () => setChecked({});

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal */}
      <div className="bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
        style={{ width: "min(920px, 96vw)", height: "min(88vh, 800px)" }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-white flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Full Pick List</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {order.id} &mdash; {order.productName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Printer size={13} /> Print
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
              <Download size={13} /> Export
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div className="flex items-center gap-4 px-5 py-2.5 bg-gray-50 border-b border-gray-200 flex-shrink-0 flex-wrap gap-y-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="font-semibold text-gray-900">{totalItems}</span> total items
          </div>
          <div className="w-px h-3.5 bg-gray-300" />
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
            <span className="font-semibold text-gray-900">{blockedGroups}</span> blocked groups
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
            <span className="font-semibold text-gray-900">{notEnoughCount}</span> not enough
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-2 h-2 rounded-full bg-blue-700 flex-shrink-0" />
            <span className="font-semibold text-gray-900">{waitingCount}</span> waiting
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-green-700">
              {pickedCount}/{totalItems} picked ({pct}%)
            </span>
            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Search + Filter + Bulk actions ── */}
        <div className="flex items-center gap-3 px-5 py-2.5 border-b border-gray-200 bg-white flex-shrink-0 flex-wrap gap-y-2">
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-1.5 flex-1 min-w-[160px]">
            <Search size={13} className="text-gray-400 flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by part name or code..."
              className="flex-1 text-xs bg-transparent focus:outline-none text-gray-700 placeholder-gray-400 min-w-0"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Filter pills */}
          <div className="flex gap-1 flex-wrap">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeFilter === f
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Bulk actions */}
          <div className="flex gap-2">
            <button
              onClick={checkAll}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Check all
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={uncheckAll}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
        </div>

        {/* ── Table header ── */}
        <div className="grid bg-gray-50 border-b border-gray-200 flex-shrink-0 text-xs font-semibold text-gray-500 uppercase tracking-wide"
          style={{ gridTemplateColumns: "40px 1fr 80px 60px 130px", padding: "6px 20px" }}>
          <div />
          <div>Item</div>
          <div className="text-right">Qty</div>
          <div className="text-right">Unit</div>
          <div className="text-right pr-1">Status</div>
        </div>

        {/* ── Scrollable rows ── */}
        <div className="flex-1 overflow-y-auto">
          {order.components.map((comp) => {
            const isExpanded = expanded[comp.id];
            const isBlocked = comp.status === "BLOCKED";
            const isStart = comp.status === "START";
            const borderAccent = isBlocked
              ? "border-l-4 border-l-red-400"
              : isStart
              ? "border-l-4 border-l-blue-500"
              : "border-l-4 border-l-transparent";
            const rowBg = isBlocked ? "bg-red-50" : "bg-gray-50";

            // Filtered items
            const visibleItems = (comp.items || []).filter(
              (item) => matchFilter(item) && matchSearch(item)
            );
            // If searching/filtering and no children match, still show group header
            const showGroup =
              !search.trim() && activeFilter === "All"
                ? true
                : visibleItems.length > 0 ||
                  comp.name.toLowerCase().includes(search.toLowerCase());

            if (!showGroup) return null;

            return (
              <div key={comp.id}>
                {/* Group header row */}
                <div
                  className={`grid items-center cursor-pointer hover:opacity-90 border-b border-gray-100 ${rowBg} ${borderAccent}`}
                  style={{
                    gridTemplateColumns: "40px 1fr 80px 60px 130px",
                    padding: "8px 20px",
                  }}
                  onClick={() => toggleExpand(comp.id)}
                >
                  <div className="flex items-center justify-center">
                    {isExpanded ? (
                      <ChevronDown size={14} className="text-gray-500" />
                    ) : (
                      <ChevronRight size={14} className="text-gray-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                      {comp.code || "—"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{comp.name}</p>
                      <p className="text-xs text-gray-400 truncate">{comp.sub}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm font-bold text-gray-800">{comp.qty}</div>
                  <div className="text-right text-xs text-gray-400">{comp.unit}</div>
                  <div className="flex justify-end pr-1">
                    <StatusBadge status={comp.status} />
                  </div>
                </div>

                {/* Child item rows */}
                {isExpanded && (
                  <>
                    {visibleItems.length === 0 && comp.items.length > 0 && (
                      <div className="py-2 text-center text-xs text-gray-400 italic border-b border-gray-100"
                        style={{ paddingLeft: "60px" }}>
                        No items match current filter
                      </div>
                    )}
                    {visibleItems.length === 0 && comp.items.length === 0 && (
                      <div className="py-2 text-xs text-gray-400 italic border-b border-gray-100"
                        style={{ paddingLeft: "60px" }}>
                        No sub-items
                      </div>
                    )}
                    {visibleItems.map((item) => {
                      const isPicked = !!checked[item.id];
                      return (
                        <div
                          key={item.id}
                          className={`grid items-center border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            isPicked ? "bg-green-50 opacity-60" : "bg-white"
                          }`}
                          style={{
                            gridTemplateColumns: "40px 1fr 80px 60px 130px",
                            padding: "6px 20px",
                            paddingLeft: "60px",
                          }}
                        >
                          {/* Checkbox */}
                          <div className="flex items-center justify-center" style={{ marginLeft: "-20px" }}>
                            <button
                              onClick={() => toggleCheck(item.id)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                isPicked
                                  ? "bg-green-500 border-green-500 text-white"
                                  : "border-gray-300 hover:border-gray-500 bg-white"
                              }`}
                            >
                              {isPicked && <Check size={11} strokeWidth={3} />}
                            </button>
                          </div>

                          {/* Name */}
                          <div className="min-w-0">
                            <p className={`text-xs font-semibold text-gray-800 ${isPicked ? "line-through text-gray-400" : ""}`}>
                              {item.name}
                            </p>
                            {item.sub && item.sub !== item.name && (
                              <p className="text-xs text-gray-400 truncate mt-0.5">{item.sub}</p>
                            )}
                          </div>

                          {/* Qty */}
                          <div className="text-right text-sm font-bold text-gray-800">{item.qty}</div>

                          {/* Unit */}
                          <div className="text-right text-xs text-gray-400">{item.unit}</div>

                          {/* Status */}
                          <div className="flex justify-end pr-1">
                            <StatusBadge status={item.status} />
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            );
          })}

          {/* Empty state */}
          {order.components.every((c) => {
            const visible = (c.items || []).filter(
              (i) => matchFilter(i) && matchSearch(i)
            );
            return (
              visible.length === 0 &&
              !c.name.toLowerCase().includes(search.toLowerCase())
            );
          }) && search && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Search size={32} className="mb-3 opacity-30" />
              <p className="text-sm">No items match &ldquo;{search}&rdquo;</p>
              <button onClick={() => setSearch("")} className="mt-2 text-xs text-blue-500 hover:underline">
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <p className="text-xs text-gray-500">
            {pickedCount === totalItems && totalItems > 0
              ? "✅ All items picked!"
              : `Click checkboxes to mark items as picked`}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
