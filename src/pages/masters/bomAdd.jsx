// BomForm.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  X, Plus, Search, ChevronDown,
  CheckCircle2, ArrowLeft, Package, Layers, Minus,
} from "lucide-react";
import useBom from "../../hooks/useBom";
import useProduct from "../../hooks/useProduct";

// ─── Constants ────────────────────────────────────────────────────────────────
const generateId = () =>
  `bom_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

// ─── StatusBadge ──────────────────────────────────────────────────────────────
function StatusBadge({ category }) {
  const map = {
    "Raw Material":  { bg: "bg-blue-50",   text: "text-blue-600",   label: "Raw Mat." },
    "Component":     { bg: "bg-purple-50", text: "text-purple-600", label: "Component" },
    "Sub-Assembly":  { bg: "bg-amber-50",  text: "text-amber-600",  label: "Sub-Assy" },
  };
  const s = map[category] || { bg: "bg-gray-100", text: "text-gray-500", label: category };
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded ${s.bg} ${s.text} whitespace-nowrap`}>
      {s.label}
    </span>
  );
}

// ─── Product search dropdown ──────────────────────────────────────────────────
function ItemSearchDropdown({ onSelect, existingIds, catalogue }) {
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

  const filtered = catalogue.filter(
    (c) =>
      !existingIds.includes(c.id) &&
      (!search.trim() ||
        c.product_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.article_no?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (item) => {
    onSelect(item);
    setSearch("");
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 border border-dashed border-[#017e84] rounded px-3 py-1.5 text-xs text-[#017e84] hover:bg-[#f0fafa] transition-colors"
      >
        <Plus size={12} /> Add Product
      </button>

      {open && (
        <div className="absolute z-40 left-0 top-full mt-1 w-[40vw] bg-white border border-gray-200 rounded shadow-xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
            <Search size={12} className="text-gray-400 flex-shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or article no…"
              className="flex-1 text-xs bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
                <X size={11} />
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-xs text-gray-400 px-4 py-4 text-center">
                {search ? "No items match your search" : "All items already added"}
              </p>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 border-b border-gray-100 last:border-0 text-left hover:bg-[#f0fafa] transition-colors group"
                >
                  <div className="w-8 h-8 rounded border border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:border-[#017e84] group-hover:bg-[#e8f5f5] transition-colors">
                    <Package size={13} className="text-gray-400 group-hover:text-[#017e84]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{item.product_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.article_no} · {item.uom_name}</p>
                  </div>
                  {item.category_name && <StatusBadge category={item.category_name} />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-item row ─────────────────────────────────────────────────────────────
function SubItemRow({ item, onQtyChange, onRemove }) {
  const handleIncrement = () => onQtyChange(item.rowId, item.qty + 1);
  const handleDecrement = () => { if (item.qty > 1) onQtyChange(item.rowId, item.qty - 1); };
  const handleInputChange = (e) => {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v) && v >= 1) onQtyChange(item.rowId, v);
  };

  return (
    <tr className="border-b border-gray-100 group hover:bg-gray-50 transition-colors">
      <td className="pl-10 pr-2 py-2 w-10">
        <div className="w-8 h-8 rounded border border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0">
          <Package size={14} className="text-gray-400" />
        </div>
      </td>
      <td className="px-2 py-2">
        <p className="text-xs font-semibold text-gray-900 leading-tight">{item.product_name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{item.article_no}</p>
      </td>
      <td className="px-3 py-2 w-28 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={item.qty <= 1}
            className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Minus size={12} />
          </button>
          <input
            type="number"
            value={item.qty}
            onChange={handleInputChange}
            className="w-12 text-center text-sm border border-gray-200 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
            min={1}
          />
          <button
            type="button"
            onClick={handleIncrement}
            className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Plus size={12} />
          </button>
        </div>
      </td>
      <td className="px-3 py-2 w-16 text-xs text-gray-500 font-medium">{item.uom_name}</td>
      <td className="px-3 py-2 w-36 text-right">
        {item.category_name && <StatusBadge category={item.category_name} />}
      </td>
      <td className="px-3 py-2 w-10 text-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onRemove(item.rowId)}
          className="text-gray-300 hover:text-red-400 transition-colors"
        >
          <X size={14} />
        </button>
      </td>
    </tr>
  );
}

// ─── Main BOM Form ────────────────────────────────────────────────────────────
export default function BomForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // present on edit route
  const isEdit = Boolean(id);

  const { createBom, updateBom, getBoms, loading } = useBom();
  const { getProducts } = useProduct();

  // BOM header
  const [bomName, setBomName] = useState("");
  const [subItems, setSubItems] = useState([]);
  const [saved, setSaved] = useState(false);

  // Products catalogue from API
  const [catalogue, setCatalogue] = useState([]);

  /* ==========================
     LOAD PRODUCTS (catalogue)
  ========================== */
  useEffect(() => {
    const fetchProducts = async () => {
      const res = await getProducts();
      if (res?.success) {
        setCatalogue(res.data || []);
      }
    };
    fetchProducts();
  }, []);

  /* ==========================
     LOAD BOM FOR EDIT
  ========================== */
  useEffect(() => {
    if (!isEdit) return;
    const fetchBom = async () => {
      const res = await getBoms();
      if (res?.success) {
        const bom = (res.data || []).find((b) => String(b.bom_id) === String(id));
        if (bom) {
          setBomName(bom.bom_name || "");
          setSubItems(
            (bom.items || []).map((item) => ({
              ...item,
              rowId: generateId(),
              id: item.product_id || item.id,
              product_name: item.product_name,
              article_no: item.article_no,
              uom_name: item.uom_name,
              category_name: item.category_name,
              qty: Number(item.qty) || 1,
            }))
          );
        }
      }
    };
    fetchBom();
  }, [id]);

  /* ==========================
     SUB-ITEMS HANDLERS
  ========================== */
  const handleAddItem = (product) => {
    setSubItems((prev) => [
      ...prev,
      {
        id: product.id,
        rowId: generateId(),
        product_name: product.product_name,
        article_no: product.article_no,
        uom_name: product.uom_name,
        category_name: product.category_name,
        qty: 1,
      },
    ]);
  };

  const handleQtyChange = (rowId, newQty) => {
    setSubItems((prev) =>
      prev.map((i) => (i.rowId === rowId ? { ...i, qty: newQty } : i))
    );
  };

  const handleRemoveItem = (rowId) => {
    setSubItems((prev) => prev.filter((i) => i.rowId !== rowId));
  };

  /* ==========================
     SAVE
  ========================== */
  const handleSave = async (e) => {
    e.preventDefault();
    if (!bomName.trim()) return;

    const payload = {
      bom_name: bomName.trim(),
      items: subItems.map(({ id: product_id, qty }) => ({ product_id, qty })),
    };

    const res = isEdit
      ? await updateBom(id, payload)
      : await createBom(payload);

    if (res?.success) {
      setSaved(true);
      setTimeout(() => navigate("/masters/bom"), 800);
    }
  };

  const existingIds = subItems.map((i) => i.id);
  const isValid = bomName.trim();

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">

      {/* ── Top action bar ── */}
      <div className="bg-white border-b border-gray-200 px-2 sm:px-4 py-1.5 flex items-center gap-0.5 flex-shrink-0 overflow-x-auto">
        <button
          type="button"
          onClick={() => navigate("/masters/bom")}
          className="flex items-center gap-1.5 text-xs text-gray-600 hover:bg-gray-100 px-2.5 py-1.5 rounded transition-colors whitespace-nowrap"
        >
          <ArrowLeft size={13} /> Back
        </button>
        <div className="w-px h-4 bg-gray-200 mx-0.5 flex-shrink-0" />
        <div className="flex-1" />
        {saved ? (
          <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium pr-2 whitespace-nowrap">
            <CheckCircle2 size={16} className="text-green-500" /> Saved
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 pr-2 whitespace-nowrap">
            <div className="w-2 h-2 rounded-full bg-amber-400" /> Unsaved
          </div>
        )}
      </div>

      {/* ── Scrollable body ── */}
      <form onSubmit={handleSave} className="flex-1 overflow-y-auto">

        {/* ── BOM Header card ── */}
        <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-gray-200">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded border border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0">
              <Layers size={26} className="text-gray-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-1">BOM Name *</p>
              <input
                type="text"
                value={bomName}
                onChange={(e) => setBomName(e.target.value)}
                placeholder="Enter BOM name…"
                required
                className="w-full text-lg sm:text-xl font-semibold text-gray-900 bg-transparent focus:outline-none border-b-2 border-transparent focus:border-[#017e84] hover:border-gray-300 transition-colors pb-0.5 placeholder-gray-300"
              />
            </div>
          </div>
        </div>

        {/* ── Sub-items section ── */}
        <div className="px-4 sm:px-6 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-base font-semibold text-gray-800">Products</p>
            <span className="text-xs text-gray-400">
              {subItems.length} item{subItems.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="border border-gray-200 rounded overflow-hidden overflow-x-auto mb-3">
            {subItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 select-none">
                <Package size={32} strokeWidth={1} className="mb-3 text-gray-200" />
                <p className="text-sm text-gray-500 text-center px-4">No Product added yet</p>
                <p className="text-xs text-gray-400 mt-1 text-center px-4">
                  Use the <span className="font-medium text-gray-500">Add Product</span> button below
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[540px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="pl-10 pr-2 py-2 w-10" />
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500">Item</th>
                    <th className="px-3 py-2 w-24 text-right text-xs font-semibold text-gray-500">Qty</th>
                    <th className="px-3 py-2 w-16 text-left text-xs font-semibold text-gray-500">Unit</th>
                    <th className="px-3 py-2 w-36 text-right text-xs font-semibold text-gray-500">Category</th>
                    <th className="px-3 py-2 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {subItems.map((item) => (
                    <SubItemRow
                      key={item.rowId}
                      item={item}
                      onQtyChange={handleQtyChange}
                      onRemove={handleRemoveItem}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <ItemSearchDropdown
            onSelect={handleAddItem}
            existingIds={existingIds}
            catalogue={catalogue}
          />
        </div>

        {/* ── Bottom action bar ── */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-3 mt-4">
          <button
            type="button"
            onClick={() => navigate("/masters/bom")}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid || loading}
            className={`px-6 py-2 text-sm font-semibold rounded-md transition-colors shadow-sm
              ${isValid && !loading
                ? "bg-[#017e84] text-white hover:bg-[#015f64]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
          >
            {loading ? "Saving…" : isEdit ? "Update BOM" : "Save BOM"}
          </button>
        </div>
      </form>
    </div>
  );
}