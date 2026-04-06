import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { appendOrder } from "../redux/Slices/orderSlice";
import useBom from "../hooks/useBom";
import useOrders from "../hooks/useOrders";
import useProject from "../hooks/useProject";
import StatusBadge from "../components/StatusBadge";
import {
  X, Plus, Settings, Paperclip, Copy, Printer,
  Mail, XCircle, Check, MoreHorizontal,
  Search, ChevronDown, ChevronRight,
} from "lucide-react";

// ─── BOM multi-select dropdown ────────────────────────────────────────────────
function BomDropdown({ boms, selectedIds, onChange, bomLoading }) {
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

  const filtered = boms.filter(
    (b) =>
      !search.trim() ||
      b.bom_name?.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) =>
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((s) => s !== id)
        : [...selectedIds, id]
    );

  const selectedBoms = boms.filter((b) => selectedIds.includes(b.bom_id));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 min-w-[220px] max-w-xs border border-gray-300 rounded px-3 py-1.5 bg-white hover:border-[#017e84] transition-colors text-left"
      >
        {selectedIds.length === 0 ? (
          <span className="text-xs text-gray-400 flex-1">
            {bomLoading ? "Loading BOMs…" : "Select BOM(s)…"}
          </span>
        ) : (
          <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
            {selectedBoms.slice(0, 3).map((b) => (
              <span
                key={b.bom_id}
                className="inline-flex items-center gap-1 bg-[#e8f5f5] text-[#017e84] text-xs font-semibold px-2 py-0.5 rounded"
              >
                {b.bom_name}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggle(b.bom_id); }}
                  className="hover:text-red-500 leading-none"
                >
                  <X size={9} />
                </button>
              </span>
            ))}
            {selectedIds.length > 3 && (
              <span className="text-xs text-gray-400">+{selectedIds.length - 3}</span>
            )}
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
              placeholder="Search BOMs…"
              className="flex-1 text-xs bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
                <X size={11} />
              </button>
            )}
            <div className="border-l border-gray-200 pl-2 flex items-center gap-2">
              <button type="button" onClick={() => onChange(boms.map((b) => b.bom_id))} className="text-xs text-[#017e84] hover:underline font-medium">All</button>
              <button type="button" onClick={() => onChange([])} className="text-xs text-gray-400 hover:text-gray-600 font-medium">Clear</button>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {bomLoading ? (
              <p className="text-xs text-gray-400 px-4 py-4 text-center">Loading…</p>
            ) : filtered.length === 0 ? (
              <p className="text-xs text-gray-400 px-4 py-4 text-center">
                {search ? "No results" : "No BOMs available"}
              </p>
            ) : (
              filtered.map((bom) => {
                const isSel = selectedIds.includes(bom.bom_id);
                const itemCount = bom.items?.length || 0;
                return (
                  <button
                    key={bom.bom_id}
                    type="button"
                    onClick={() => toggle(bom.bom_id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 border-b border-gray-100 last:border-0 text-left transition-colors hover:bg-gray-50 ${isSel ? "bg-[#f0fafa]" : ""}`}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${isSel ? "bg-[#017e84] border-[#017e84]" : "border-gray-300 bg-white"}`}>
                      {isSel && <Check size={9} strokeWidth={3} className="text-white" />}
                    </div>
                    <div className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 ${isSel ? "bg-[#017e84] text-white" : "bg-gray-100 text-gray-600"}`}>
                      {bom.bom_name?.charAt(0)?.toUpperCase() || "B"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{bom.bom_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {bom.product_name && <span>{bom.product_name} · </span>}
                        {itemCount} item{itemCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {bom.uom_name && (
                      <span className="text-[10px] text-gray-400 font-medium flex-shrink-0">{bom.uom_name}</span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {selectedIds.length > 0 && (
            <div className="px-3 py-2 bg-[#f0fafa] border-t border-[#c8e6e8] flex items-center justify-between">
              <p className="text-xs text-[#017e84] font-medium">
                {selectedIds.length} BOM{selectedIds.length > 1 ? "s" : ""} selected
              </p>
              <button type="button" onClick={() => setOpen(false)} className="text-xs text-[#017e84] font-semibold hover:underline">Done</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Item Row ─────────────────────────────────────────────────────────────────
function ItemRow({ item, onUpdateItem }) {
  const [localNeeded, setLocalNeeded] = useState(String(item.neededQty));
  const [localPick, setLocalPick] = useState(String(item.pickNos));

  useEffect(() => {
    setLocalNeeded(String(item.neededQty));
    setLocalPick(String(item.pickNos));
  }, [item.neededQty, item.pickNos]);

  const handleNeededBlur = () => {
    let v = parseFloat(localNeeded);
    if (isNaN(v) || v < 0) v = 0;
    let pick = item.pickNos;
    if (pick > v) pick = v;
    if (v !== item.neededQty || pick !== item.pickNos) onUpdateItem({ neededQty: v, pickNos: pick });
    else setLocalNeeded(String(item.neededQty));
  };

  const handlePickBlur = () => {
    let v = parseFloat(localPick);
    if (isNaN(v) || v < 0) v = 0;
    if (v > item.neededQty) v = item.neededQty;
    if (v !== item.pickNos) onUpdateItem({ pickNos: v });
    else setLocalPick(String(item.pickNos));
  };

  const onKey = (e, fn) => { if (e.key === "Enter") { e.preventDefault(); fn(); } };
  const remaining = (item.neededQty - item.pickNos).toFixed(2);

  return (
    <tr className={`border-b border-gray-100 group transition-colors ${item.delivered ? "bg-green-100" : "hover:bg-gray-50"}`}>
      <td className="pl-10 pr-2 py-2 w-10">
        <div className="w-8 h-8 rounded border border-gray-200 bg-gray-50 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
          </svg>
        </div>
      </td>
      <td className="px-2 py-2">
        <p className="text-xs font-semibold text-gray-900 leading-tight">{item.name}</p>
        {item.sub && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-md">{item.sub}</p>}
      </td>
      <td className="px-3 py-2 w-28 text-right">
        <input type="number" value={item.usualQty} disabled className="w-20 text-right text-sm text-gray-800 bg-gray-100 border-0 rounded px-1 py-0.5 cursor-default" />
      </td>
      <td className="px-3 py-2 w-28 text-right">
        <input type="number" value={localNeeded} onChange={(e) => setLocalNeeded(e.target.value)} onBlur={handleNeededBlur} onKeyDown={(e) => onKey(e, handleNeededBlur)}
          className="w-20 text-right text-sm text-gray-800 border-0 focus:outline-none focus:ring-1 focus:ring-[#017e84] rounded px-1 py-0.5 bg-transparent hover:bg-gray-100" min="0" step="0.5" />
      </td>
      <td className="px-3 py-2 w-28 text-right">
        <input type="number" value={localPick} onChange={(e) => setLocalPick(e.target.value)} onBlur={handlePickBlur} onKeyDown={(e) => onKey(e, handlePickBlur)}
          className="w-20 text-right text-sm text-gray-800 border-0 focus:outline-none focus:ring-1 focus:ring-[#017e84] rounded px-1 py-0.5 bg-transparent hover:bg-gray-100" min="0" max={item.neededQty} step="0.5" />
      </td>
      <td className="px-3 py-2 w-28 text-right text-sm text-gray-700">{remaining}</td>
      <td className="px-3 py-2 w-24 text-right"><StatusBadge status={item.status} /></td>
      <td className="px-3 py-2 w-12 text-center">
        <button onClick={() => onUpdateItem({ delivered: !item.delivered })}
          className={`w-5 h-5 flex items-center justify-center mx-auto transition-colors ${item.delivered ? "text-green-600" : "text-gray-300 hover:text-gray-500"}`}>
          <Check size={16} strokeWidth={item.delivered ? 2.5 : 1.5} />
        </button>
      </td>
      <td className="px-2 py-2 w-8 text-right opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={14} /></button>
      </td>
    </tr>
  );
}

// ─── BomSection (collapsible) ─────────────────────────────────────────────────
function BomSection({ bom, onItemUpdate }) {
  const [collapsed, setCollapsed] = useState(false);
  const items = bom.items || [];
  const countDelivered = items.filter((i) => i.delivered).length;

  return (
    <>
      <tr className="bg-white border-b border-gray-200">
        <td colSpan={9} className="py-0">
          <div className="flex items-center gap-3 px-4 py-2.5 border-l-4 border-l-[#017e84]">
            <button type="button" onClick={() => setCollapsed((p) => !p)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
              {collapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
            </button>
            <div className="w-9 h-9 rounded border border-gray-200 bg-white flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 leading-tight">{bom.bom_name}</p>
              <p className="text-xs text-gray-500 leading-tight">
                {bom.product_name}
                {collapsed && (
                  <span className="ml-2 text-gray-400">
                    · {items.length} items hidden
                    {countDelivered > 0 && <span className="text-green-600 ml-1">{countDelivered}✓</span>}
                  </span>
                )}
              </p>
            </div>
            <span className="text-sm text-gray-700 font-medium mr-1">
              {items.length} <span className="text-xs text-gray-400">{bom.uom_name}</span>
            </span>
            <button type="button" className="text-gray-300 hover:text-gray-500 ml-1"><MoreHorizontal size={15} /></button>
          </div>
        </td>
      </tr>
      {!collapsed && items.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          onUpdateItem={(updates) => onItemUpdate(item.id, updates)}
        />
      ))}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OrderAddPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getBoms, loading: bomLoading } = useBom();
  const { createOrder, loading: saving } = useOrders();
  const { getProjects } = useProject();

  // BOM catalogue
  const [bomList, setBomList] = useState([]);
  const [selectedBomIds, setSelectedBomIds] = useState([]);

  // Projects
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  // Header fields
  const [requisitionNo, setRequisitionNo] = useState("");
  const [requisitionDate, setRequisitionDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [projectId, setProjectId] = useState("");

  // Remarks
  const [addingRemark, setAddingRemark] = useState(false);
  const [remarkText, setRemarkText] = useState("");
  const [remarks, setRemarks] = useState([]);

  const [showRawMaterials, setShowRawMaterials] = useState(false);

  // Enriched BOMs
  const [enrichedBoms, setEnrichedBoms] = useState([]);

  /* ==========================
     FETCH BOMs
  ========================== */
  useEffect(() => {
    const fetchBoms = async () => {
      const res = await getBoms();
      if (res?.success) setBomList(res.data || []);
    };
    fetchBoms();
  }, []);

  /* ==========================
     FETCH PROJECTS
  ========================== */
  useEffect(() => {
    const fetchProjects = async () => {
      setProjectsLoading(true);
      const res = await getProjects();
      if (res?.success) setProjects(res.data || []);
      setProjectsLoading(false);
    };
    fetchProjects();
  }, []);

  /* ==========================
     ENRICH ON SELECTION CHANGE
  ========================== */
  useEffect(() => {
    setEnrichedBoms((prev) => {
      const prevMap = Object.fromEntries(prev.map((b) => [b.bom_id, b]));
      return selectedBomIds.map((id) => {
        if (prevMap[id]) return prevMap[id];
        const bom = bomList.find((b) => b.bom_id === id);
        if (!bom) return null;
        return {
          ...bom,
          items: (bom.items || []).map((item, idx) => ({
            ...item,
            id: item.product_id || `${id}_${idx}`,
            name: item.product_name || "",
            sub: item.article_no || "",
            usualQty: Number(item.qty) || 0,
            neededQty: Number(item.qty) || 0,
            pickNos: 0,
            delivered: false,
          })),
        };
      }).filter(Boolean);
    });
  }, [selectedBomIds, bomList]);

  /* ==========================
     ITEM UPDATE
  ========================== */
  const handleItemUpdate = (bomId, itemId, updates) => {
    setEnrichedBoms((prev) =>
      prev.map((bom) =>
        bom.bom_id === bomId
          ? { ...bom, items: bom.items.map((item) => item.id === itemId ? { ...item, ...updates } : item) }
          : bom
      )
    );
  };

  /* ==========================
     REMARKS
  ========================== */
  const handleAddRemark = () => {
    if (remarkText.trim()) {
      setRemarks([...remarks, remarkText.trim()]);
      setRemarkText("");
      setAddingRemark(false);
    }
  };

  /* ==========================
     VALIDATION
  ========================== */
  const isValid = requisitionDate && selectedBomIds.length > 0;

  /* ==========================
     BUILD PAYLOAD & SAVE
  ========================== */
  const handleCreateOrder = async () => {
    const selectedProject = projects.find((p) => p.id === projectId);

    const payload = {
      project_id: projectId ? Number(projectId) : 1,
      requisition_date: requisitionDate,
      boms: enrichedBoms.map((bom) => ({
        bom_id: bom.bom_id,
        items: bom.items.map((item) => ({
          product_id: item.id,
          qty: item.neededQty,
          pick_qty: item.pickNos,
        })),
      })),
    };

    const res = await createOrder(payload);
    if (res?.success) {
      dispatch(appendOrder({
        id: String(res.data?.id || Date.now()),
        requisition_date: payload.requisition_date,
        project_id: payload.project_id,
        project_name: selectedProject?.project_name || "",
        status: "1",
        created_at: new Date().toISOString().replace("T", " ").slice(0, 19),
        boms: enrichedBoms.map((bom) => ({
          bom_id: bom.bom_id,
          items: bom.items.map((item) => ({
            product_id: item.id,
            product_name: item.name,
            qty: String(item.neededQty),
          })),
        })),
      }));
      navigate(`/orders/${res.data?.id || ""}`);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">

      {/* ── Top action bar ── */}
      {/* <div className="bg-white border-b border-gray-200 px-2 sm:px-4 py-1.5 flex items-center gap-0.5 flex-shrink-0 overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Cancel? All changes will be lost.")) navigate("/orders");
          }}
          className="flex items-center gap-1.5 text-xs text-[#e04c4c] hover:bg-red-50 px-2.5 py-1.5 rounded transition-colors whitespace-nowrap"
        >
          <XCircle size={13} /> Cancel
        </button>
        <div className="w-px h-4 bg-gray-200 mx-0.5 flex-shrink-0" />
        <button type="button" className="flex items-center gap-1.5 text-xs text-gray-600 hover:bg-gray-100 px-2.5 py-1.5 rounded transition-colors whitespace-nowrap">
          <Paperclip size={13} /> Attachments
        </button>
        <button type="button" className="flex items-center gap-1.5 text-xs text-gray-600 hover:bg-gray-100 px-2.5 py-1.5 rounded transition-colors whitespace-nowrap">
          <Copy size={13} /> Copy
        </button>
        <button type="button" className="flex items-center gap-1.5 text-xs text-gray-600 hover:bg-gray-100 px-2.5 py-1.5 rounded transition-colors whitespace-nowrap">
          <Printer size={13} /> Print <ChevronDown size={10} className="text-gray-400" />
        </button>
        <button type="button" className="flex items-center gap-1.5 text-xs text-gray-600 hover:bg-gray-100 px-2.5 py-1.5 rounded transition-colors whitespace-nowrap">
          <Mail size={13} /> Email <ChevronDown size={10} className="text-gray-400" />
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium pr-2 whitespace-nowrap">
          <div className="w-2 h-2 rounded-full bg-amber-400" /> Draft - Not saved
        </div>
      </div> */}

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Header fields ── */}
        <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-4">

            {/* Requisition No */}
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Requisition No</p>
              <input
                type="text"
                value={requisitionNo}
                onChange={(e) => setRequisitionNo(e.target.value)}
                placeholder="REQ-2026-0001"
                className="text-sm text-gray-800 bg-transparent focus:outline-none w-full placeholder-gray-300 border-b border-transparent focus:border-[#017e84] hover:border-gray-300 transition-colors pb-0.5"
              />
            </div>

            {/* Requisition Date */}
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Requisition Date *</p>
              <input
                type="date"
                value={requisitionDate}
                onChange={(e) => setRequisitionDate(e.target.value)}
                className="text-sm text-gray-800 bg-transparent focus:outline-none w-full border-b border-transparent focus:border-[#017e84] hover:border-gray-300 transition-colors pb-0.5"
              />
            </div>

            {/* Project No — now a proper dropdown */}
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Project No</p>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                disabled={projectsLoading}
                className="text-sm text-gray-800 bg-transparent focus:outline-none w-full border-b border-transparent focus:border-[#017e84] hover:border-gray-300 transition-colors pb-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {projectsLoading ? "Loading projects…" : "Select project…"}
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.project_name}  {p.partner_name}
                  </option>
                ))}
              </select>
            </div>

          </div>
          <button type="button" className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mt-3">
            <Settings size={12} /> Manage
          </button>
        </div>

        {/* ── Remarks + BOM selector ── */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">

            <div className="flex-1 min-w-0 w-full">
              <p className="text-sm font-semibold text-gray-800 mb-2">Remarks</p>
              <div className="flex items-center gap-2 flex-wrap">
                {remarks.map((r, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded px-2.5 py-1 text-xs text-gray-700">
                    <span>{r}</span>
                    <button type="button" onClick={() => setRemarks(remarks.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-400">
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {addingRemark ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <input autoFocus value={remarkText} onChange={(e) => setRemarkText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddRemark()}
                      placeholder="Type remark…"
                      className="text-xs border border-gray-300 rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#017e84] w-44" />
                    <button type="button" onClick={handleAddRemark} className="text-xs bg-[#017e84] text-white px-2.5 py-1 rounded hover:bg-[#015f64]">Add</button>
                    <button type="button" onClick={() => { setAddingRemark(false); setRemarkText(""); }} className="text-gray-400 hover:text-gray-600"><X size={13} /></button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setAddingRemark(true)} className="flex items-center gap-1 text-xs text-[#017e84] hover:underline">
                    <Plus size={12} /> Add remarks
                  </button>
                )}
              </div>
            </div>

            <div className="hidden sm:block w-px self-stretch bg-gray-200 flex-shrink-0" />

            <div className="flex-shrink-0 w-full sm:w-[20vw]">
              <p className="text-sm font-semibold text-gray-800 mb-2">Component Group (BOM)</p>
              <BomDropdown
                boms={bomList}
                selectedIds={selectedBomIds}
                onChange={setSelectedBomIds}
                bomLoading={bomLoading}
              />
            </div>
          </div>

          <div className="flex items-center justify-end mt-4">
            <button
              type="button"
              onClick={handleCreateOrder}
              disabled={!isValid || saving}
              className={`w-full sm:w-auto px-5 py-2 font-semibold text-sm rounded transition-colors
                ${isValid && !saving ? "bg-[#017e84] hover:bg-[#015f64] text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
            >
              {saving ? "Creating…" : "Create Order"}
            </button>
          </div>
        </div>

        {/* ── Overview ── */}
        <div className="px-4 sm:px-6 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-base font-semibold text-gray-800">Overview</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Show raw materials</span>
              <button type="button" onClick={() => setShowRawMaterials((p) => !p)}
                className={`relative inline-flex w-9 h-5 rounded-full transition-colors ${showRawMaterials ? "bg-[#017e84]" : "bg-gray-200"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${showRawMaterials ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded overflow-hidden overflow-x-auto">
            {enrichedBoms.length === 0 ? (
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
              <table className="w-full min-w-[1000px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-10" />
                    <th className="text-left text-xs font-medium text-gray-500 py-2 px-2">Material</th>
                    <th className="text-right text-xs font-medium text-gray-500 py-2 px-3 w-28">Usually required</th>
                    <th className="text-right text-xs font-medium text-gray-500 py-2 px-3 w-28">Needed</th>
                    <th className="text-right text-xs font-medium text-gray-500 py-2 px-3 w-28">Pick NOS</th>
                    <th className="text-right text-xs font-medium text-gray-500 py-2 px-3 w-28">Remaining NOS</th>
                    <th className="text-right text-xs font-medium text-gray-500 py-2 px-3 w-24">Status</th>
                    <th className="text-center text-xs font-medium text-gray-500 py-2 px-3 w-12">Mark</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {enrichedBoms.map((bom) => (
                    <BomSection
                      key={bom.bom_id}
                      bom={bom}
                      onItemUpdate={(itemId, updates) => handleItemUpdate(bom.bom_id, itemId, updates)}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* <button type="button" className="flex items-center gap-1 text-xs text-[#017e84] hover:underline mt-3 mb-6">
            <Plus size={12} /> Add another finished product
          </button> */}
        </div>
      </div>
    </div>
  );
}