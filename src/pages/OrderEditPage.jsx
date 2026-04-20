import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateDraftOrder, clearDraftOrder } from "../redux/Slices/orderSlice";
import useBom from "../hooks/useBom";
import useOrders from "../hooks/useOrders";
import useProject from "../hooks/useProject";
import useProduct from "../hooks/useProduct";
import StatusBadge from "../components/StatusBadge";
import {
  X, Plus, Settings, Search, ChevronDown, ChevronRight, Check, MoreHorizontal,
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

  // Normalize selectedIds to strings for consistent comparison
  const selectedIdSet = new Set(selectedIds.map(id => String(id)));

  const filtered = boms.filter(
    (b) =>
      !search.trim() ||
      b.bom_name?.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) => {
    const idStr = String(id);
    if (selectedIdSet.has(idStr)) {
      onChange(selectedIds.filter((s) => String(s) !== idStr));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const isSelected = (id) => selectedIdSet.has(String(id));

  const selectedBoms = boms.filter((b) => isSelected(b.bom_id));

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
        <div className="absolute z-[9999] left-0 top-full mt-1 w-80 bg-white border border-gray-200 rounded shadow-2xl overflow-hidden">
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
                const isSel = isSelected(bom.bom_id);
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
function ItemRow({ item, onUpdateItem, onSwap, onCopy, onRemove, productList, productLoading }) {
  const [localNeeded, setLocalNeeded] = useState(String(item.neededQty));
  const [localPick, setLocalPick] = useState(String(item.pickNos));
  const [menuOpen, setMenuOpen] = useState(false);
  const [swapSelectorOpen, setSwapSelectorOpen] = useState(false);
  const [swapSearch, setSwapSearch] = useState("");
  const [menuCoords, setMenuCoords] = useState(null);
  const [swapCoords, setSwapCoords] = useState(null);
  const menuButtonRef = useRef(null);
  const menuRef = useRef(null);
  const swapRef = useRef(null);

  useEffect(() => {
    setLocalNeeded(String(item.neededQty));
    setLocalPick(String(item.pickNos));
  }, [item.neededQty, item.pickNos]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (swapRef.current && !swapRef.current.contains(e.target)) setSwapSelectorOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

  const filteredProducts = productList.filter(
    (p) => p.id !== item.productId && (!swapSearch.trim() || p.product_name?.toLowerCase().includes(swapSearch.toLowerCase()) || p.article_no?.toLowerCase().includes(swapSearch.toLowerCase()))
  );

  const isMarked = item.pickNos > 0;
  const toggleMark = () => {
    if (isMarked) {
      onUpdateItem({ pickNos: 0 });
    } else {
      const newPick = item.neededQty > 0 ? item.neededQty : 1;
      onUpdateItem({ pickNos: newPick });
    }
  };

  const openMenu = () => {
    const rect = menuButtonRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuCoords({
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right,
      });
    }
    setMenuOpen(true);
  };

  const openSwapSelector = () => {
    const rect = menuButtonRef.current?.getBoundingClientRect();
    if (rect) {
      setSwapCoords({
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right,
      });
    }
    setSwapSelectorOpen(true);
    setMenuOpen(false);
  };

  const handleSwapSelect = (product) => {
    onSwap(product.id);
    setSwapSelectorOpen(false);
    setSwapSearch("");
    setSwapCoords(null);
  };

  const handleCopy = () => {
    onCopy();
    setMenuOpen(false);
    setMenuCoords(null);
  };

  const handleRemove = () => {
    onRemove();
    setMenuOpen(false);
    setMenuCoords(null);
  };

  return (
    <tr className={`border-b border-gray-100 group transition-colors ${isMarked ? "bg-green-100" : "hover:bg-gray-50"}`}>
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
      <td className="px-2 py-2 w-10 text-center">
        <button
          onClick={toggleMark}
          className={`w-5 h-5 flex items-center justify-center mx-auto rounded transition-colors ${
            isMarked
              ? "text-[#017e84] bg-[#e8f5f5]"
              : "text-gray-300 hover:text-gray-500 hover:bg-gray-100"
          }`}
          title={isMarked ? "Unmark item" : "Mark item"}
        >
          <Check size={14} strokeWidth={isMarked ? 2.5 : 1.5} />
        </button>
      </td>
      <td className="px-2 py-2 w-8 text-right relative">
        <div ref={menuButtonRef}>
          <button
            onClick={openMenu}
            className="text-gray-400 hover:text-gray-600 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
        {menuOpen && menuCoords && createPortal(
          <div
            ref={menuRef}
            style={{ position: 'absolute', top: menuCoords.top, right: menuCoords.right }}
            className="w-32 bg-white border border-gray-200 rounded shadow-lg z-[9998]"
          >
            <button onClick={openSwapSelector} className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100">Swap</button>
            <button onClick={handleCopy} className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100">Copy</button>
            <button onClick={handleRemove} className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-gray-100">Remove</button>
          </div>,
          document.body
        )}
        {swapSelectorOpen && swapCoords && createPortal(
          <div
            ref={swapRef}
            style={{ position: 'absolute', top: swapCoords.top, right: swapCoords.right }}
            className="w-[20vw] bg-white border border-gray-200 rounded shadow-xl z-[9999]"
          >
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
              <Search size={12} className="text-gray-400" />
              <input
                autoFocus
                value={swapSearch}
                onChange={(e) => setSwapSearch(e.target.value)}
                placeholder="Search product..."
                className="flex-1 text-xs bg-transparent focus:outline-none"
              />
              {swapSearch && (
                <button onClick={() => setSwapSearch("")} className="text-gray-400 hover:text-gray-600">
                  <X size={11} />
                </button>
              )}
            </div>
            <div className="max-h-48 overflow-y-auto">
              {productLoading ? (
                <p className="text-xs text-gray-400 px-4 py-3 text-center">Loading...</p>
              ) : filteredProducts.length === 0 ? (
                <p className="text-xs text-gray-400 px-4 py-3 text-center">
                  {swapSearch ? "No products match" : "No other products"}
                </p>
              ) : (
                filteredProducts.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => handleSwapSelect(prod)}
                    className="w-full text-left px-3 py-2 border-b border-gray-100 last:border-0 hover:bg-[#f0fafa] text-xs"
                  >
                    <p className="font-semibold text-gray-800">{prod.product_name}</p>
                    <p className="text-gray-400 text-[11px]">{prod.article_no} · {prod.uom_name}</p>
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body
        )}
      </td>
    </tr>
  );
}

// ─── BomSection ───────────────────────────────────────────────────────────────
function BomSection({ bom, onItemUpdate, onSwapItem, onCopyItem, onRemoveItem, onAddProductToBom, onRemoveBom, productList, productLoading, loading }) {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [menuCoords, setMenuCoords] = useState(null);
  const [pickerCoords, setPickerCoords] = useState(null);
  const menuButtonRef = useRef(null);
  const menuRef = useRef(null);
  const pickerRef = useRef(null);
  const items = bom.items || [];
  const countMarked = items.filter((i) => i.pickNos > 0).length;

  // At the top of BomSection component
console.log("BomSection received bom:", bom.bom_id, bom.bom_name);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setProductPickerOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openMenu = () => {
    const rect = menuButtonRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuCoords({ top: rect.bottom + window.scrollY, right: window.innerWidth - rect.right });
    }
    setMenuOpen(true);
  };

  const handleAddProductClick = () => {
    setMenuOpen(false);
    const rect = menuButtonRef.current?.getBoundingClientRect();
    if (rect) {
      setPickerCoords({ top: rect.bottom + window.scrollY, right: window.innerWidth - rect.right });
    }
    setProductPickerOpen(true);
    setProductSearch("");
  };

  const handleRemoveBomClick = () => {
    setMenuOpen(false);
    onRemoveBom(bom.bom_id);
  };

  const filteredProducts = productList.filter(
    (p) => !productSearch.trim() || p.product_name?.toLowerCase().includes(productSearch.toLowerCase()) || p.article_no?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleSelectProduct = (product) => {
    onAddProductToBom(bom.bom_id, product);
    setProductPickerOpen(false);
    setProductSearch("");
    setPickerCoords(null);
  };

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
              <p className="text-sm font-bold text-gray-900 leading-tight">{bom.bom_name || `BOM #${bom.bom_id}`}</p>
              <p className="text-xs text-gray-500 leading-tight">
                {bom.product_name}
                {collapsed && (
                  <span className="ml-2 text-gray-400">
                    · {items.length} items hidden
                    {countMarked > 0 && <span className="text-[#017e84] ml-1 font-medium">{countMarked}✓</span>}
                  </span>
                )}
              </p>
            </div>
            {loading && (
              <span className="text-xs text-gray-400 animate-pulse">Loading items…</span>
            )}
            <span className="text-sm text-gray-700 font-medium mr-1">
              {items.length} <span className="text-xs text-gray-400">{bom.uom_name}</span>
            </span>
            <div className="relative">
              <button ref={menuButtonRef} onClick={openMenu} className="text-gray-300 hover:text-gray-500 ml-1">
                <MoreHorizontal size={15} />
              </button>
              {menuOpen && menuCoords && createPortal(
                <div
                  ref={menuRef}
                  style={{ position: 'absolute', top: menuCoords.top, right: menuCoords.right }}
                  className="w-36 bg-white border border-gray-200 rounded shadow-lg z-[9998]"
                >
                  <button onClick={handleAddProductClick} className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100">Add product</button>
                  <button onClick={handleRemoveBomClick} className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-gray-100">Remove BOM</button>
                </div>,
                document.body
              )}
              {productPickerOpen && pickerCoords && createPortal(
                <div
                  ref={pickerRef}
                  style={{ position: 'absolute', top: pickerCoords.top, right: pickerCoords.right }}
                  className="w-[20vw] bg-white border border-gray-200 rounded shadow-xl z-[9999]"
                >
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
                    <Search size={12} className="text-gray-400" />
                    <input
                      autoFocus
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search product..."
                      className="flex-1 text-xs bg-transparent focus:outline-none"
                    />
                    {productSearch && (
                      <button onClick={() => setProductSearch("")} className="text-gray-400 hover:text-gray-600">
                        <X size={11} />
                      </button>
                    )}
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {productLoading ? (
                      <p className="text-xs text-gray-400 px-4 py-3 text-center">Loading...</p>
                    ) : filteredProducts.length === 0 ? (
                      <p className="text-xs text-gray-400 px-4 py-3 text-center">
                        {productSearch ? "No products match" : "No products available"}
                      </p>
                    ) : (
                      filteredProducts.map((prod) => (
                        <button
                          key={prod.id}
                          onClick={() => handleSelectProduct(prod)}
                          className="w-full text-left px-3 py-2 border-b border-gray-100 last:border-0 hover:bg-[#f0fafa] text-xs"
                        >
                          <p className="font-semibold text-gray-800">{prod.product_name}</p>
                          <p className="text-gray-400 text-[11px]">{prod.article_no} · {prod.uom_name}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>,
                document.body
              )}
            </div>
          </div>
        </td>
      </tr>
      {!collapsed && items.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          onUpdateItem={(updates) => onItemUpdate(item.id, updates)}
          onSwap={(newProductId) => onSwapItem(item.id, newProductId)}
          onCopy={() => onCopyItem(item.id)}
          onRemove={() => onRemoveItem(item.id)}
          productList={productList}
          productLoading={productLoading}
        />
      ))}
    </>
  );
}

// ─── Main Page (OrderEditPage) with Redux persistence ─────────────────────────
export default function OrderEditPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id: requisitionId } = useParams();

  const draftOrder = useSelector((state) => state.orders.draftOrder);

  const { getBoms, loading: bomLoading } = useBom();
  const { updateOrder, getOrderById, reqProduct, loading: saving } = useOrders();
  const { getProjects } = useProject();
  const { getProducts, loading: productLoading } = useProduct();

  const [bomList, setBomList] = useState([]);
  const [selectedBomIds, setSelectedBomIds] = useState([]);
  const [productList, setProductList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [loadingBomIds, setLoadingBomIds] = useState(new Set());
  const [requisitionNo, setRequisitionNo] = useState("");
  const [requisitionDate, setRequisitionDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [projectId, setProjectId] = useState("");
  const [remarks, setRemarks] = useState([]);
  const [addingRemark, setAddingRemark] = useState(false);
  const [remarkText, setRemarkText] = useState("");
  const [enrichedBoms, setEnrichedBoms] = useState([]);

  const bomsCacheRef = useRef(new Map());
  const fetchedBomIdsRef = useRef(new Set());

  // ── KEY FIX: always compare bom_id as String since API returns "5" not 5 ──
  const getBomMeta = (bomId) =>
    bomList.find((b) => String(b.bom_id) === String(bomId));

  const getBomName = (bomId) =>
    getBomMeta(bomId)?.bom_name || `BOM #${bomId}`;

  // ── Reset on requisitionId change ──────────────────────────────────────────
  useEffect(() => {
    dispatch(clearDraftOrder());
    bomsCacheRef.current.clear();
    fetchedBomIdsRef.current.clear();
    setLoadingBomIds(new Set());
    setEnrichedBoms([]);
    setSelectedBomIds([]);
    setRequisitionNo("");
    setRequisitionDate(new Date().toISOString().split("T")[0]);
    setProjectId("");
    setRemarks([]);
  }, [requisitionId, dispatch]);

  // ── Sync enrichedBoms → Redux ──────────────────────────────────────────────
  const syncToRedux = useCallback((updatedEnrichedBoms) => {
    const bomsForRedux = updatedEnrichedBoms.map((bom) => ({
      bom_id: bom.bom_id,
      bom_name: bom.bom_name,
      product_name: bom.product_name,
      uom_name: bom.uom_name,
      status: bom.status,
      items: bom.items.map((item) => ({
        product_id: item.product_id || item.productId,
        product_name: item.name,
        article_no: item.sub,
        uom_name: item.uom_name || "",
        qty: item.neededQty,
        pick_qty: item.pickNos,
        deliver: item.pickNos > 0,
        status: item.status,
      })),
    }));

    dispatch(
      updateDraftOrder({
        requisition_id: Number(requisitionId),
        requisition_no: requisitionNo,
        requisition_date: requisitionDate,
        project_id: projectId ? Number(projectId) : null,
        project_name: projects.find((p) => p.id === Number(projectId))?.project_name || "",
        remarks,
        boms: bomsForRedux,
      })
    );
  }, [dispatch, requisitionId, requisitionNo, requisitionDate, projectId, projects, remarks]);

  // ── 1. Fetch BOMs, products, projects on mount ─────────────────────────────
  useEffect(() => {
    getBoms().then((res) => { if (res?.success) setBomList(res.data || []); });
  }, []);

  useEffect(() => {
    getProducts().then((res) => { if (res?.success) setProductList(res.data || []); });
  }, []);

  useEffect(() => {
    setProjectsLoading(true);
    getProjects().then((res) => {
      if (res?.success) setProjects(res.data || []);
      setProjectsLoading(false);
    });
  }, []);

  // ── 2. Load existing order OR restore from draft ───────────────────────────
  useEffect(() => {
    if (!requisitionId) return;
    let isMounted = true;

    const loadOrderData = async () => {
      setPageLoading(true);

      // Restore from draft if available
      if (draftOrder && draftOrder.requisition_id === Number(requisitionId)) {
        if (isMounted) {
          setRequisitionNo(draftOrder.requisition_no || "");
          setRequisitionDate(draftOrder.requisition_date || new Date().toISOString().split("T")[0]);
          setProjectId(draftOrder.project_id ? String(draftOrder.project_id) : "");
          setRemarks(draftOrder.remarks || []);

          const restoredBoms = (draftOrder.boms || []).map((draftBom) => ({
            bom_id: draftBom.bom_id,
            bom_name: draftBom.bom_name || getBomName(draftBom.bom_id),
            product_name: draftBom.product_name,
            uom_name: draftBom.uom_name,
            items: (draftBom.items || []).map((item) => ({
              id: `${draftBom.bom_id}_${item.product_id}`,
              productId: item.product_id,
              product_id: item.product_id,
              name: item.product_name,
              sub: item.article_no || "",
              usualQty: item.qty,
              neededQty: item.qty,
              pickNos: item.pick_qty,
              status: item.status,
            })),
          }));

          restoredBoms.forEach((bom) => {
            bomsCacheRef.current.set(String(bom.bom_id), bom);
            fetchedBomIdsRef.current.add(String(bom.bom_id));
          });
          setSelectedBomIds(restoredBoms.map((b) => b.bom_id));
          setEnrichedBoms(restoredBoms);
        }
        setPageLoading(false);
        return;
      }

      // Fetch from API
      const res = await getOrderById(requisitionId);
      if (isMounted && res?.success && res.data) {
        const order = res.data;
        setRequisitionNo(order.requisition_no || "");
        setRequisitionDate(order.requisition_date?.split("T")[0] || new Date().toISOString().split("T")[0]);
        setProjectId(order.project_id ? String(order.project_id) : "");
        setRemarks(order.remarks || []);

        const existingMarkedBoms = (order.boms || [])
          .map((bom) => {
            const meta = getBomMeta(bom.bom_id);
            const enriched = {
              bom_id: bom.bom_id,
              // ✅ FIX: use bom_name directly from API response, fallback to bomList lookup
              bom_name: bom.bom_name || meta?.bom_name || `BOM #${bom.bom_id}`,
              product_name: meta?.product_name || bom.product_name || "",
              uom_name: meta?.uom_name || bom.uom_name || "",
              items: (bom.items || [])
                .filter((item) => item.pick_qty > 0)
                .map((item) => ({
                  id: `${bom.bom_id}_${item.product_id}`,
                  productId: item.product_id,
                  product_id: item.product_id,
                  name: item.product_name,
                  sub: item.article_no || "",
                  usualQty: item.qty,
                  neededQty: item.qty,
                  pickNos: item.pick_qty,
                  uom_name: item.uom_name || "",
                  delivered: true,
                  status: item.status || "original",
                })),
            };
            return enriched;
          })
          .filter((bom) => bom.items.length > 0);

        // ✅ Cache immediately so fetchNewBoms doesn't re-fetch and overwrite
        existingMarkedBoms.forEach((bom) => {
          bomsCacheRef.current.set(String(bom.bom_id), bom);
          fetchedBomIdsRef.current.add(String(bom.bom_id));
        });

        setSelectedBomIds(existingMarkedBoms.map((b) => b.bom_id));
        setEnrichedBoms(existingMarkedBoms);

        dispatch(
          updateDraftOrder({
            requisition_id: Number(requisitionId),
            requisition_no: order.requisition_no,
            requisition_date: order.requisition_date?.split("T")[0],
            project_id: order.project_id,
            project_name: order.project_name,
            remarks: order.remarks,
            boms: existingMarkedBoms,
          })
        );
      }
      if (isMounted) setPageLoading(false);
    };

    loadOrderData();
    return () => { isMounted = false; };
  }, [requisitionId, bomList]);

// Replace the existing useEffect for fetching BOM items with this:

// ── 3. Fetch items for ALL selected BOMs (always fresh) ─────────────────────────────────
useEffect(() => {
  if (!requisitionId || selectedBomIds.length === 0) return;

  const fetchAllBomsFresh = async () => {
    // Clear existing cache for these BOMs to force fresh fetch
    const bomIdsToFetch = selectedBomIds;
    
    setLoadingBomIds(new Set(bomIdsToFetch));

    await Promise.all(
      bomIdsToFetch.map(async (bomId) => {
        try {
          const res = await reqProduct({ 
            bom_id: bomId, 
            requisition_id: Number(requisitionId) 
          });
          
          // Always update cache with fresh data
          const meta = getBomMeta(bomId);
          const items = res?.success && Array.isArray(res.data)
            ? res.data.map((item, idx) => ({
                id: `${bomId}_${item.product_id || idx}`,
                productId: item.product_id,
                product_id: item.product_id,
                name: item.product_name || "",
                sub: item.article_no || "",
                uom_name: item.uom_name || "",
                usualQty: Number(item.bom_qty) || 0,
                neededQty: Number(item.req_qty) || Number(item.bom_qty) || 0,
                pickNos: Number(item.pick_qty) || 0,
                delivered: false,
                status: "original",
                _isSelected: Boolean(item.is_selected),
              }))
            : [];

          const enriched = {
            bom_id: bomId,
            bom_name: meta?.bom_name || `BOM #${bomId}`,
            product_name: meta?.product_name || "",
            uom_name: meta?.uom_name || "",
            items,
          };

          bomsCacheRef.current.set(String(bomId), enriched);
          fetchedBomIdsRef.current.add(String(bomId));
        } catch (err) {
          console.error(`Failed to fetch items for BOM ${bomId}:`, err);
          const meta = getBomMeta(bomId);
          bomsCacheRef.current.set(String(bomId), {
            bom_id: bomId,
            bom_name: meta?.bom_name || `BOM #${bomId}`,
            product_name: meta?.product_name || "",
            uom_name: meta?.uom_name || "",
            items: [],
          });
          fetchedBomIdsRef.current.add(String(bomId));
        }
      })
    );

    setLoadingBomIds(new Set());

    // Update enriched Boms with fresh data
    setEnrichedBoms(
      selectedBomIds.map((id) => bomsCacheRef.current.get(String(id))).filter(Boolean)
    );
  };

  fetchAllBomsFresh();
}, [selectedBomIds, requisitionId, bomList]); // Remove the dependency that checks fetchedBomIdsRef

  // ── Apply _isSelected flag on first load ───────────────────────────────────
  useEffect(() => {
    setEnrichedBoms((prev) =>
      prev.map((bom) => ({
        ...bom,
        items: bom.items.map((item) => {
          if (item._isSelected === undefined) return item;
          return {
            ...item,
            pickNos: item._isSelected && item.pickNos === 0 ? item.neededQty : item.pickNos,
            _isSelected: undefined,
          };
        }),
      }))
    );
  }, [enrichedBoms.length]);

  // ── Keep cache + Redux in sync ─────────────────────────────────────────────
  useEffect(() => {
    enrichedBoms.forEach((bom) => bomsCacheRef.current.set(String(bom.bom_id), bom));
    syncToRedux(enrichedBoms);
  }, [enrichedBoms, requisitionNo, requisitionDate, projectId, remarks]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleItemUpdate = (bomId, itemId, updates) =>
    setEnrichedBoms((prev) =>
      prev.map((bom) =>
        bom.bom_id === bomId
          ? { ...bom, items: bom.items.map((item) => item.id === itemId ? { ...item, ...updates } : item) }
          : bom
      )
    );

  const handleRemoveBomItem = (bomId, itemId) =>
    setEnrichedBoms((prev) =>
      prev.map((bom) =>
        bom.bom_id === bomId
          ? { ...bom, items: bom.items.filter((item) => item.id !== itemId) }
          : bom
      )
    );

  const handleRemoveBom = (bomId) => {
    setEnrichedBoms((prev) => prev.filter((bom) => bom.bom_id !== bomId));
    setSelectedBomIds((prev) => prev.filter((id) => id !== bomId));
    bomsCacheRef.current.delete(String(bomId));
    fetchedBomIdsRef.current.delete(String(bomId));
    const updatedBoms = (draftOrder?.boms || []).filter((b) => String(b.bom_id) !== String(bomId));
    dispatch(updateDraftOrder({ ...(draftOrder || {}), boms: updatedBoms }));
  };

  const handleSwapBomItem = (bomId, itemId, newProductId) => {
    const newProduct = productList.find((p) => p.id === newProductId);
    if (!newProduct) return;
    setEnrichedBoms((prev) =>
      prev.map((bom) =>
        bom.bom_id === bomId
          ? {
              ...bom,
              items: bom.items.map((item) =>
                item.id === itemId
                  ? { ...item, productId: newProduct.id, product_id: newProduct.id, name: newProduct.product_name, sub: newProduct.article_no || "", usualQty: 1, status: "swapped" }
                  : item
              ),
            }
          : bom
      )
    );
  };

  const handleCopyBomItem = (bomId, itemId) =>
    setEnrichedBoms((prev) =>
      prev.map((bom) => {
        if (bom.bom_id !== bomId) return bom;
        const itemToCopy = bom.items.find((i) => i.id === itemId);
        if (!itemToCopy) return bom;
        return {
          ...bom,
          items: [
            ...bom.items,
            { ...itemToCopy, id: `${bomId}_copy_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, pickNos: 0, delivered: false, status: "added" },
          ],
        };
      })
    );

  const handleAddProductToBom = (bomId, product) =>
    setEnrichedBoms((prev) =>
      prev.map((bom) =>
        bom.bom_id === bomId
          ? {
              ...bom,
              items: [
                ...bom.items,
                {
                  id: `${bomId}_new_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                  productId: product.id,
                  product_id: product.id,
                  name: product.product_name,
                  sub: product.article_no || "",
                  usualQty: 1,
                  neededQty: 1,
                  pickNos: 0,
                  delivered: false,
                  status: "added",
                },
              ],
            }
          : bom
      )
    );

  const handleAddRemark = () => {
    if (!remarkText.trim()) return;
    const newRemarks = [...remarks, remarkText.trim()];
    setRemarks(newRemarks);
    setRemarkText("");
    setAddingRemark(false);
    if (draftOrder) dispatch(updateDraftOrder({ ...draftOrder, remarks: newRemarks }));
  };

  const buildPayloadFromDraft = (orderStatus) => {
    const bomsPayload = (draftOrder?.boms || [])
      .map((bom) => ({
        bom_id: bom.bom_id,
        items: (bom.items || [])
          .filter((item) => item.pick_qty > 0)
          .map((item) => ({
            product_id: item.product_id,
            qty: item.qty,
            pick_qty: item.pick_qty,
            deliver: true,
            item_status: item.status || "original",
          })),
      }))
      .filter((bom) => bom.items.length > 0);

    return {
      project_id: projectId ? Number(projectId) : 1,
      requisition_date: requisitionDate,
      requisition_no: requisitionNo || undefined,
      remarks: remarks.length > 0 ? remarks : undefined,
      order_status: orderStatus,
      boms: bomsPayload,
    };
  };

  const isValid = requisitionDate && selectedBomIds.length > 0;

  const handleSaveAsDraft = async () => {
    const payload = buildPayloadFromDraft(0);
    if (payload.boms.length === 0) return alert("Please mark at least one item to save as draft.");
    const res = await updateOrder(requisitionId, payload);
    if (res?.success) { alert("Draft saved successfully."); dispatch(clearDraftOrder()); }
    else alert("Failed to save draft.");
  };

  const handleUpdateRequisition = async () => {
    const payload = buildPayloadFromDraft(1);
    if (payload.boms.length === 0) return alert("Please mark at least one item to update requisition.");
    const res = await updateOrder(requisitionId, payload);
    if (res?.success) {
      alert("Requisition updated successfully.");
      dispatch(clearDraftOrder());
      navigate(`/orders/${requisitionId}`);
    } else alert("Failed to update requisition.");
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <p className="text-sm text-gray-400 animate-pulse">Loading requisition…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-4 sm:px-6 pt-4 pb-2 flex items-center gap-3 border-b border-gray-100">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Editing
          </span>
          <p className="text-sm font-semibold text-gray-700">
            Requisition {requisitionNo ? `#${requisitionNo}` : `#${requisitionId}`}
          </p>
          <button type="button" onClick={() => navigate(`/orders/${requisitionId}`)} className="ml-auto text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
            <X size={12} /> Cancel
          </button>
        </div>

        {/* Header fields */}
        <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-4">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Requisition Date *</p>
              <input type="date" value={requisitionDate} onChange={(e) => setRequisitionDate(e.target.value)}
                className="text-sm text-gray-800 bg-transparent focus:outline-none w-full border-b border-transparent focus:border-[#017e84] hover:border-gray-300 transition-colors pb-0.5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Requisition No</p>
              <input type="text" value={requisitionNo} onChange={(e) => setRequisitionNo(e.target.value)} placeholder="e.g. REQ-001"
                className="text-sm text-gray-800 bg-transparent focus:outline-none w-full border-b border-transparent focus:border-[#017e84] hover:border-gray-300 transition-colors pb-0.5 placeholder-gray-300" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Project No</p>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)} disabled={projectsLoading}
                className="text-sm text-gray-800 bg-transparent focus:outline-none w-full border-b border-transparent focus:border-[#017e84] hover:border-gray-300 transition-colors pb-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <option value="">{projectsLoading ? "Loading projects…" : "Select project…"}</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.project_name} {p.partner_name}</option>)}
              </select>
            </div>
          </div>
          <button type="button" className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mt-3">
            <Settings size={12} /> Manage
          </button>
        </div>

        {/* Remarks + BOM selector */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <div className="flex-1 min-w-0 w-full">
              <p className="text-sm font-semibold text-gray-800 mb-2">Remarks</p>
              <div className="flex items-center gap-2 flex-wrap">
                {remarks.map((r, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded px-2.5 py-1 text-xs text-gray-700">
                    <span>{r}</span>
                    <button type="button" onClick={() => setRemarks(remarks.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-400"><X size={10} /></button>
                  </div>
                ))}
                {addingRemark ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <input autoFocus value={remarkText} onChange={(e) => setRemarkText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddRemark()} placeholder="Type remark…"
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
              <BomDropdown boms={bomList} selectedIds={selectedBomIds} onChange={setSelectedBomIds} bomLoading={bomLoading} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 flex-wrap">
            <button type="button" onClick={() => navigate(`/orders/${requisitionId}`)}
              className="w-full sm:w-auto px-5 py-2 font-semibold text-sm rounded transition-colors border border-gray-300 text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="button" onClick={handleSaveAsDraft} disabled={!isValid || saving}
              className="w-full sm:w-auto px-5 py-2 font-semibold text-sm rounded transition-colors bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? "Saving…" : "Save as Draft"}
            </button>
            <button type="button" onClick={handleUpdateRequisition} disabled={!isValid || saving}
              className={`w-full sm:w-auto px-5 py-2 font-semibold text-sm rounded transition-colors ${isValid && !saving ? "bg-[#017e84] hover:bg-[#015f64] text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
              {saving ? "Updating…" : "Update Requisition"}
            </button>
          </div>
        </div>

        {/* Overview table */}
        <div className="px-4 sm:px-6 pt-4 pb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-base font-semibold text-gray-800">Overview</p>
            {enrichedBoms.length > 0 && (
              <p className="text-xs text-gray-400">
                {enrichedBoms.reduce((acc, b) => acc + b.items.filter((i) => i.pickNos > 0).length, 0)} item(s) marked
              </p>
            )}
          </div>

          <div className="border border-gray-200 rounded overflow-visible">
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full min-w-[1050px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-10" />
                    <th className="text-left text-xs font-medium text-gray-500 py-2 px-2">Material</th>
                    <th className="text-right text-xs font-medium text-gray-500 py-2 px-3 w-28">Usually required</th>
                    <th className="text-right text-xs font-medium text-gray-500 py-2 px-3 w-28">Needed</th>
                    <th className="text-right text-xs font-medium text-gray-500 py-2 px-3 w-28">Pick NOS</th>
                    <th className="text-right text-xs font-medium text-gray-500 py-2 px-3 w-28">Remaining NOS</th>
                    <th className="text-right text-xs font-medium text-gray-500 py-2 px-3 w-24">Status</th>
                    <th className="text-center text-xs font-medium text-gray-500 py-2 px-3 w-10">Mark</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {enrichedBoms.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-xs text-gray-400">
                        No BOMs selected. Use the BOM selector above to add component groups.
                      </td>
                    </tr>
                  ) : (
                    enrichedBoms.map((bom) => (
                      <BomSection
                        key={bom.bom_id}
                        bom={bom}  // ✅ bom.bom_name is already correct, no override needed
                        loading={loadingBomIds.has(bom.bom_id)}
                        onItemUpdate={(itemId, updates) => handleItemUpdate(bom.bom_id, itemId, updates)}
                        onSwapItem={(itemId, newProductId) => handleSwapBomItem(bom.bom_id, itemId, newProductId)}
                        onCopyItem={(itemId) => handleCopyBomItem(bom.bom_id, itemId)}
                        onRemoveItem={(itemId) => handleRemoveBomItem(bom.bom_id, itemId)}
                        onAddProductToBom={handleAddProductToBom}
                        onRemoveBom={handleRemoveBom}
                        productList={productList}
                        productLoading={productLoading}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}