import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useProduct from "../../hooks/useProduct";
import useHsn from "../../hooks/useHsn";
import usePartner from "../../hooks/usePartner";

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();

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

  /* ==========================
     FETCH DROPDOWNS
  ========================== */
  useEffect(() => {
    const fetchDropdownData = async () => {
      setLoadingDropdowns(true);

      try {
        const [catRes, typeRes, hsnRes, partnerRes] = await Promise.all([
          getProductCategories(),
          getProductTypes(),
          getHsns(),
          getPartners(),
        ]);

        if (catRes?.success)     setCategories(catRes.data || []);
        if (typeRes?.success)    setItemTypes(typeRes.data || []);
        if (hsnRes?.success)     setHsnList(hsnRes.data || []);
        if (partnerRes?.success) setPartners(partnerRes.data || []);

        // 🔥 TEMP MOCK (replace later with API)
        setUoms([
          { id: 1, name: "Nos" },
          { id: 2, name: "Kg" },
        ]);

        setManufacturers([
          { id: 1, name: "ABB" },
          { id: 2, name: "Siemens" },
        ]);

      } catch (err) {
        console.error("Dropdown error:", err);
      } finally {
        setLoadingDropdowns(false);
      }
    };

    fetchDropdownData();
  }, []);

  /* ==========================
     FETCH PRODUCT (EDIT)
  ========================== */
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      const result = await getProducts();

      if (result?.success) {
        const product = result.data.find(
          (p) => String(p.id) === String(id)
        );

        if (product) {
          setForm({
            product_name:    product.product_name    || "",
            article_no:      product.article_no      || "",
            category_id:     product.category_id     || "",
            uom_id:          product.uom_id          || "",
            item_type_id:    product.item_type_id    || "",
            manufacturer_id: product.manufacturer_id || "",
            partner_name:    product.partner_name    || "",
            hsn_code:        product.hsn_code        || "",
            drawing_no:      product.drawing_no      || "",
          });
        }
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ==========================
     SUBMIT
  ========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      product_name:    form.product_name.trim(),
      article_no:      form.article_no.trim(),
      category_id:     parseInt(form.category_id),
      uom_id:          parseInt(form.uom_id),
      item_type_id:    parseInt(form.item_type_id),
      manufacturer_id: parseInt(form.manufacturer_id),
      partner_name:    form.partner_name,
      hsn_code:        form.hsn_code,
      drawing_no:      form.drawing_no,
    };

    const result = id
      ? await updateProduct(id, payload)
      : await createProduct(payload);

    if (result?.success) {
      navigate("/masters/products");
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#017e84]";

  const selectClass =
    "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#017e84]";

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">

        {/* Header */}
        <div className="border-b px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800">
            {id ? "Edit Product" : "Add Product"}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            <input
              name="article_no"
              value={form.article_no}
              onChange={handleChange}
              placeholder="Article No"
              className={inputClass}
            />

            <input
              name="product_name"
              value={form.product_name}
              onChange={handleChange}
              placeholder="Product Name"
              className={inputClass}
            />

            <select name="category_id" value={form.category_id} onChange={handleChange} className={selectClass}>
              <option value="">Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.category_name}</option>
              ))}
            </select>

            <select name="item_type_id" value={form.item_type_id} onChange={handleChange} className={selectClass}>
              <option value="">Type</option>
              {itemTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.item_type_name}</option>
              ))}
            </select>

            <select name="uom_id" value={form.uom_id} onChange={handleChange} className={selectClass}>
              <option value="">UOM</option>
              {uoms.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>

            <select name="manufacturer_id" value={form.manufacturer_id} onChange={handleChange} className={selectClass}>
              <option value="">Manufacturer</option>
              {manufacturers.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>

            {/* Partner — now fetched from API */}
            <select
              name="partner_name"
              value={form.partner_name}
              onChange={handleChange}
              className={selectClass}
              disabled={loadingDropdowns}
            >
              <option value="">
                {loadingDropdowns ? "Loading partners..." : "Partner"}
              </option>
              {partners.map((p) => (
                <option key={p.id} value={p.partner_name}>
                  {p.partner_name}
                </option>
              ))}
            </select>

            <select name="hsn_code" value={form.hsn_code} onChange={handleChange} className={selectClass}>
              <option value="">HSN</option>
              {hsnList.map((h) => (
                <option key={h.id} value={h.hsn_code}>{h.hsn_code}</option>
              ))}
            </select>

            <input
              name="drawing_no"
              value={form.drawing_no}
              onChange={handleChange}
              placeholder="Drawing No"
              className={inputClass}
            />

          </div>

          {/* Buttons */}
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