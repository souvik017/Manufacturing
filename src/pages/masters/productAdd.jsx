import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useProduct from "../../hooks/useProduct";
import useHsn from "../../hooks/useHsn";
import usePartner from "../../hooks/usePartner";
import useManufacture from "../../hooks/useManufacture";
import useUomCategory from "../../hooks/useUomCategory";   // ✅ UOM hook

// ==========================
// Reusable Searchable Select Component
// ==========================
const SearchableSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  loading = false,
  displayKey = "name",
  valueKey = "id",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selectedOption = options.find(
    (opt) => String(opt?.[valueKey]) === String(value)
  );
  const displayValue = selectedOption?.[displayKey] ?? "";

  const filteredOptions = options.filter((opt) => {
    const displayField = opt?.[displayKey];
    if (!displayField) return false;
    return displayField.toString().toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSelect = (opt) => {
    onChange(opt[valueKey]);
    setSearchTerm("");
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        e.preventDefault();
        break;
      case "ArrowUp":
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        e.preventDefault();
        break;
      case "Enter":
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        e.preventDefault();
        break;
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : displayValue}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || loading}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#017e84]"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"
        >
          ▼
        </button>
      </div>

      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <li className="px-3 py-2 text-gray-500 text-sm">Loading...</li>
          ) : filteredOptions.length === 0 ? (
            <li className="px-3 py-2 text-gray-500 text-sm">No options</li>
          ) : (
            filteredOptions.map((opt, idx) => (
              <li
                key={opt[valueKey]}
                onClick={() => handleSelect(opt)}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                  highlightedIndex === idx ? "bg-gray-100" : ""
                }`}
              >
                {opt[displayKey] || "—"}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

// ==========================
// Helper: auto-detect display key
// ==========================
const getDisplayKey = (item, fallbackKeys = ["name", "partner_name", "category_name", "item_type_name", "manufacturer_name", "hsn_code", "uom_name"]) => {
  if (!item) return fallbackKeys[0];
  for (let key of fallbackKeys) {
    if (item[key] !== undefined) return key;
  }
  return fallbackKeys[0];
};

// ==========================
// Main ProductForm Component
// ==========================
export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Hooks
  const {
    getProducts,
    getProductCategories,
    getProductTypes,
    createProduct,
    updateProduct,
    loading,
  } = useProduct();

  const { getHsns } = useHsn();
  const { getPartners } = usePartner();
  const { getManufacturers } = useManufacture();
  const { getUomCategories } = useUomCategory();   // ✅ UOM hook

  // State
  const [form, setForm] = useState({
    product_name: "",
    article_no: "",
    category_id: "",
    uom_id: "",
    item_type_id: "",
    manufacturer_id: "",
    partner_name: "",
    hsn_code: "",
    drawing_no: "",
  });

  const [categories, setCategories] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [hsnList, setHsnList] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // Refs
  const dropdownFetched = useRef(false);
  const productFetched = useRef(false);

  // ==========================
  // FETCH DROPDOWNS (ONCE)
  // ==========================
  useEffect(() => {
    if (dropdownFetched.current) return;
    dropdownFetched.current = true;

    const fetchDropdownData = async () => {
      setLoadingDropdowns(true);
      try {
        const [catRes, typeRes, hsnRes, partnerRes, manuRes, uomRes] = await Promise.all([
          getProductCategories(),
          getProductTypes(),
          getHsns(),
          getPartners(),
          getManufacturers(),
          getUomCategories({ page: 1, limit: 100 }),   // ✅ fetch UOMs
        ]);

        if (catRes?.success) setCategories(catRes.data || []);
        if (typeRes?.success) setItemTypes(typeRes.data || []);
        if (hsnRes?.success) setHsnList(hsnRes.data || []);
        if (partnerRes?.success) setPartners(partnerRes.data || []);
        if (manuRes?.success) setManufacturers(manuRes.data || []);

        // ✅ Map UOM response (API returns { id, uom_name, status })
        if (uomRes?.success && Array.isArray(uomRes.data)) {
          const formattedUoms = uomRes.data.map(u => ({
            id: u.id,
            name: u.uom_name,
            uom_name: u.uom_name,
            status: u.status,
          }));
          setUoms(formattedUoms);
        }
      } catch (err) {
        console.error("Dropdown error:", err);
      } finally {
        setLoadingDropdowns(false);
      }
    };

    fetchDropdownData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================
  // FETCH PRODUCT (EDIT MODE)
  // ==========================
  useEffect(() => {
    if (!id) return;
    if (loadingDropdowns) return;
    if (productFetched.current) return;
    productFetched.current = true;

    const fetchProduct = async () => {
      const result = await getProducts();
      if (result?.success) {
        const product = result.data.find((p) => String(p.id) === String(id));
        if (product) {
          console.log("Fetched product for edit:", product);

          const findIdByName = (list, name, nameKey) => {
            if (!name) return "";
            const item = list.find((item) => item[nameKey] === name);
            return item ? item.id : "";
          };

          setForm({
            product_name: product.product_name || "",
            article_no: product.article_no || "",
            category_id: findIdByName(categories, product.category_name, "category_name"),
            uom_id: findIdByName(uoms, product.uom_name, "uom_name"),
            item_type_id: findIdByName(itemTypes, product.item_type_name, "item_type_name"),
            manufacturer_id: findIdByName(manufacturers, product.manufacturer_name, "manufacturer_name"),
            partner_name: product.partner_name || "",
            hsn_code: product.hsn_code || "",
            drawing_no: product.drawing_no || "",
          });
        }
      }
    };

    fetchProduct();
  }, [id, loadingDropdowns, categories, uoms, itemTypes, manufacturers]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ==========================
  // SUBMIT
  // ==========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      product_name: form.product_name.trim(),
      article_no: form.article_no.trim(),
      category_id: parseInt(form.category_id),
      uom_id: parseInt(form.uom_id),
      item_type_id: parseInt(form.item_type_id),
      manufacturer_id: parseInt(form.manufacturer_id),
      partner_name: form.partner_name,
      hsn_code: form.hsn_code,
      drawing_no: form.drawing_no,
    };

    const result = id
      ? await updateProduct(id, payload)
      : await createProduct(payload);

    if (result?.success) {
      navigate("/masters/products");
    }
  };

  const mapOptions = (list, preferredDisplayKey = null) => {
    if (!Array.isArray(list)) return [];
    return list.map((item) => {
      const displayKey = preferredDisplayKey || getDisplayKey(item);
      return {
        ...item,
        [displayKey]: item[displayKey] || "",
      };
    });
  };

  const partnerDisplayKey = partners.length > 0 && partners[0].partner_name ? "partner_name" : "name";
  const partnerValueKey = partnerDisplayKey;

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800">
            {id ? "Edit Product" : "Add Product"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <input
              name="article_no"
              value={form.article_no}
              onChange={(e) => handleChange("article_no", e.target.value)}
              placeholder="Article No"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#017e84]"
            />

            <input
              name="product_name"
              value={form.product_name}
              onChange={(e) => handleChange("product_name", e.target.value)}
              placeholder="Product Name"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#017e84]"
            />

            <SearchableSelect
              options={mapOptions(categories, "category_name")}
              value={form.category_id}
              onChange={(val) => handleChange("category_id", val)}
              placeholder="Category"
              disabled={loadingDropdowns}
              loading={loadingDropdowns}
              displayKey="category_name"
            />

            <SearchableSelect
              options={mapOptions(itemTypes, "item_type_name")}
              value={form.item_type_id}
              onChange={(val) => handleChange("item_type_id", val)}
              placeholder="Type"
              disabled={loadingDropdowns}
              loading={loadingDropdowns}
              displayKey="item_type_name"
            />

            {/* ✅ UOM Dropdown using API data */}
            <SearchableSelect
              options={mapOptions(uoms, "uom_name")}
              value={form.uom_id}
              onChange={(val) => handleChange("uom_id", val)}
              placeholder="UOM"
              disabled={loadingDropdowns}
              loading={loadingDropdowns}
              displayKey="uom_name"
              valueKey="id"
            />

            <SearchableSelect
              options={mapOptions(manufacturers, "manufacturer_name")}
              value={form.manufacturer_id}
              onChange={(val) => handleChange("manufacturer_id", val)}
              placeholder="Manufacturer"
              disabled={loadingDropdowns}
              loading={loadingDropdowns}
              displayKey="manufacturer_name"
            />

            <SearchableSelect
              options={mapOptions(partners, partnerDisplayKey)}
              value={form.partner_name}
              onChange={(val) => handleChange("partner_name", val)}
              placeholder="Partner"
              disabled={loadingDropdowns}
              loading={loadingDropdowns}
              displayKey={partnerDisplayKey}
              valueKey={partnerValueKey}
            />

            <SearchableSelect
              options={mapOptions(hsnList, "hsn_code")}
              value={form.hsn_code}
              onChange={(val) => handleChange("hsn_code", val)}
              placeholder="HSN"
              disabled={loadingDropdowns}
              loading={loadingDropdowns}
              displayKey="hsn_code"
              valueKey="hsn_code"
            />

            <input
              name="drawing_no"
              value={form.drawing_no}
              onChange={(e) => handleChange("drawing_no", e.target.value)}
              placeholder="Drawing No"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#017e84]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate("/masters/products")}
              className="px-4 py-2 border rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || loadingDropdowns}
              className="px-5 py-2 bg-[#017e84] text-white rounded-md disabled:opacity-60"
            >
              {loading ? "Saving..." : id ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}