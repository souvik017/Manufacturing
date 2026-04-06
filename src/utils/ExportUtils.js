/**
 * exportUtils.js
 * Excel export for Pick List using xlsx (SheetJS).
 *
 * Install: npm install xlsx
 *
 * Usage:
 *   import { exportToExcel } from "./exportUtils";
 *   exportToExcel(order);
 */

import * as XLSX from "xlsx";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  const day   = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year  = d.getFullYear();
  return `${day}-${month}-${year}`;
};

// ─── Style tokens ─────────────────────────────────────────────────────────────
const TEAL         = "017E84";
const WHITE        = "FFFFFF";
const TEAL_LIGHT   = "E8F5F5";
const ROW_ALT      = "F5F9F9";
const BORDER_COLOR = "C8DCDC";

const BORDER_THIN = {
  top:    { style: "thin", color: { rgb: BORDER_COLOR } },
  bottom: { style: "thin", color: { rgb: BORDER_COLOR } },
  left:   { style: "thin", color: { rgb: BORDER_COLOR } },
  right:  { style: "thin", color: { rgb: BORDER_COLOR } },
};

// ─── Column layout (A–H) ──────────────────────────────────────────────────────
// A=#, B=Product Name, C=Location, D=Sublocation, E=Qty BOM, F=Unit, G=Qty Pickup, H=Remaining Qty
const COLS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const COL_WIDTHS = [
  { wch: 5  }, // A  #
  { wch: 55 }, // B  Product Name
  { wch: 16 }, // C  Location
  { wch: 18 }, // D  Sublocation
  { wch: 10 }, // E  Qty BOM
  { wch: 8  }, // F  Unit
  { wch: 14 }, // G  Qty Pickup
  { wch: 15 }, // H  Remaining Qty
];

// ─── Cell factory ─────────────────────────────────────────────────────────────
const cell = (v, s = {}) => ({
  v: v === null || v === undefined ? "" : v,
  t: typeof v === "number" ? "n" : "s",
  s,
});

// Push a merge only if it actually spans multiple cells
const addMerge = (merges, r, c1, c2) => {
  if (c2 > c1) merges.push({ s: { r, c: c1 }, e: { r, c: c2 } });
};

// Fill all cells in a merge range so SheetJS doesn't leave gaps
const fillMerge = (ws, row, colStart, colEnd, style) => {
  for (let ci = colStart; ci <= colEnd; ci++) {
    const key = `${COLS[ci]}${row}`;
    if (!ws[key]) ws[key] = cell("", style);
  }
};

// ─── Main export ──────────────────────────────────────────────────────────────
export function exportToExcel(order) {
  const wb     = XLSX.utils.book_new();
  const ws     = {};
  const merges = [];
  let   row    = 1; // 1-indexed

  const boms           = order?.boms || [];
  const pickListNumber = `MO-${order?.id || ""}`;
  const projectNo      = order?.project_name || order?.project_no || "—";
  const requisitionNo  = order?.requisition_no || `REQ-${order?.id || ""}`;
  const reqDate        = formatDate(order?.requisition_date);
  const printDate      = formatDate(new Date());

  // ── 1. Manufacture Order heading (top) ────────────────────────────────────
  ws[`A${row}`] = cell("MANUFACTURE PICK LIST", {
    font:      { bold: true, sz: 18, color: { rgb: WHITE } },
    fill:      { patternType: "solid", fgColor: { rgb: TEAL } },
    alignment: { horizontal: "center", vertical: "center" },
  });
  fillMerge(ws, row, 1, 7, {
    fill:      { patternType: "solid", fgColor: { rgb: TEAL } },
    border:    { bottom: { style: "medium", color: { rgb: WHITE } } },
  });
  addMerge(merges, row - 1, 0, 7);
  row++;

  // ── 2. Company header ──────────────────────────────────────────────────────
  // A:D — Company name
  ws[`A${row}`] = cell("IMS Maco Services Pvt Ltd", {
    font:      { bold: true, sz: 14, color: { rgb: TEAL } },
    alignment: { vertical: "center" },
  });
  fillMerge(ws, row, 1, 3, {});
  addMerge(merges, row - 1, 0, 3);

  // A:H — Address
  row++;
  ws[`A${row}`] = cell(
    "2/5, Sarat Bose Road, Sukhsagar, 8th Floor, Flat-8C, Kolkata, West Bengal 700020 India",
    { font: { sz: 8, color: { rgb: "666666" } } }
  );
  fillMerge(ws, row, 1, 7, {});
  addMerge(merges, row - 1, 0, 7);

  // A:H — GSTIN
  row++;
  ws[`A${row}`] = cell(
    "GSTIN: 19AABCI4711Q1Z7  |  PAN: AACCM8740L  |  www.ims-gmbh.de  |  +91 33 4084 4100",
    { font: { sz: 8, color: { rgb: "888888" } } }
  );
  fillMerge(ws, row, 1, 7, {});
  addMerge(merges, row - 1, 0, 7);

  // Teal separator line
  row++;
  COLS.forEach((col) => {
    ws[`${col}${row}`] = cell("", {
      border: { bottom: { style: "medium", color: { rgb: TEAL } } },
    });
  });
  row++;

  // ── 3. Meta block ─────────────────────────────────────────────────────────
  const LABEL_S = { font: { bold: true, sz: 8,  color: { rgb: "666666" } } };
  const VALUE_S = { font: { bold: true, sz: 9,  color: { rgb: "111111" } } };

  const metaPairs = [
    ["Pick List Number", pickListNumber, "Date",            reqDate || printDate],
    ["Project No",       projectNo,      "Requisition No",  requisitionNo       ],
    ["Requisition Date", reqDate,        "Printed On",      printDate           ],
  ];

  metaPairs.forEach(([lbl1, val1, lbl2, val2]) => {
    ws[`A${row}`] = cell(lbl1, LABEL_S);
    ws[`B${row}`] = cell(val1, VALUE_S);
    fillMerge(ws, row, 2, 3, VALUE_S);
    addMerge(merges, row - 1, 1, 3);

    ws[`E${row}`] = cell(lbl2, LABEL_S);
    ws[`F${row}`] = cell(val2, VALUE_S);
    fillMerge(ws, row, 6, 7, VALUE_S);
    addMerge(merges, row - 1, 5, 7);
    row++;
  });
  row++; // blank

  // ── 4. Remarks ────────────────────────────────────────────────────────────
  const remarks = (order?.remarks || []).map((r) =>
    typeof r === "string" ? r : r.text
  );
  if (remarks.length > 0) {
    ws[`A${row}`] = cell("Remarks:", { font: { bold: true, sz: 8 } });
    const remarkStyle = {
      font: { sz: 8, color: { rgb: "92400E" } },
      fill: { patternType: "solid", fgColor: { rgb: "FEF9C3" } },
    };
    ws[`B${row}`] = cell(remarks.join("  |  "), remarkStyle);
    fillMerge(ws, row, 2, 7, remarkStyle);
    addMerge(merges, row - 1, 1, 7);
    row += 2;
  }

  // ── 5. Table header ───────────────────────────────────────────────────────
  const HDR_S = (align = "left") => ({
    font:      { bold: true, sz: 9, color: { rgb: WHITE } },
    fill:      { patternType: "solid", fgColor: { rgb: TEAL } },
    border:    BORDER_THIN,
    alignment: { horizontal: align, vertical: "center", wrapText: true },
  });

  [
    ["A", "#",              "center"],
    ["B", "Product Name",   "left"  ],
    ["C", "Location",       "left"  ],
    ["D", "Sublocation",    "left"  ],
    ["E", "Qty BOM",        "right" ],
    ["F", "Unit",           "center"],
    ["G", "Qty Pickup",     "center"],
    ["H", "Remaining Qty",  "center"],
  ].forEach(([col, label, align]) => {
    ws[`${col}${row}`] = cell(label, HDR_S(align));
  });
  row++;

  // ── 6. Data rows ──────────────────────────────────────────────────────────
  let globalIdx = 0;

  boms.forEach((bom) => {
    // BOM group sub-header (only when multiple BOMs exist)
    if (boms.length > 1) {
      const bomLabel = `▶  ${bom.bom_name}  (${(bom.items || []).length} items)`;
      const bomStyle = {
        font:      { bold: true, sz: 9, color: { rgb: TEAL } },
        fill:      { patternType: "solid", fgColor: { rgb: TEAL_LIGHT } },
        border:    BORDER_THIN,
        alignment: { vertical: "center" },
      };
      ws[`A${row}`] = cell(bomLabel, bomStyle);
      fillMerge(ws, row, 1, 7, {
        fill:   { patternType: "solid", fgColor: { rgb: TEAL_LIGHT } },
        border: BORDER_THIN,
      });
      addMerge(merges, row - 1, 0, 7);
      row++;
    }

    (bom.items || []).forEach((item) => {
      const bgFill = globalIdx % 2 === 1
        ? { patternType: "solid", fgColor: { rgb: ROW_ALT } }
        : { patternType: "solid", fgColor: { rgb: WHITE  } };

      // ✅ FIX: Remaining Qty = Qty BOM - Qty Pickup (if rem_qty not provided)
      const qtyBom     = item.qty    ?? null;
      const qtyPickup  = item.pick_qty ?? null;
      let remainQty    = item.rem_qty ?? null;
      if (remainQty === null && qtyBom !== null && qtyPickup !== null) {
        remainQty = qtyBom - qtyPickup;
      }

      [
        { col: "A", val: globalIdx + 1,               align: "center", bold: false, color: "888888", wrap: false },
        { col: "B", val: item.product_name || "",      align: "left",   bold: false, color: "111111", wrap: true  },
        { col: "C", val: item.location    || "Workshop",        align: "left",   bold: false, color: "444444", wrap: false },
        { col: "D", val: item.sublocation || "No sublocation",  align: "left",   bold: false, color: "444444", wrap: false },
        { col: "E", val: qtyBom ?? "",                 align: "right",  bold: true,  color: TEAL,     wrap: false },
        { col: "F", val: item.uom_name    || "Nos",    align: "center", bold: false, color: "444444", wrap: false },
        { col: "G", val: qtyPickup ?? "",              align: "center", bold: false, color: "444444", wrap: false },
        { col: "H", val: remainQty,                    align: "center", bold: true,
          color: typeof remainQty === "number" && remainQty > 0 ? "DC2626" : "16A34A",
          wrap: false },
      ].forEach(({ col, val, align, bold, color, wrap }) => {
        ws[`${col}${row}`] = cell(val, {
          font:      { sz: 8.5, bold, color: { rgb: color } },
          fill:      bgFill,
          border:    BORDER_THIN,
          alignment: { horizontal: align, vertical: "center", wrapText: wrap },
        });
      });

      row++;
      globalIdx++;
    });
  });

  // ── 7. Total row ──────────────────────────────────────────────────────────
  row++;
  const totalItems = boms.reduce((a, b) => a + (b.items || []).length, 0);
  const totFill    = { patternType: "solid", fgColor: { rgb: TEAL_LIGHT } };

  ws[`A${row}`] = cell("", { fill: totFill, border: BORDER_THIN });
  ws[`B${row}`] = cell(`Total Items: ${totalItems}`, {
    font:      { bold: true, sz: 9, color: { rgb: TEAL } },
    fill:      totFill,
    border:    BORDER_THIN,
    alignment: { horizontal: "left", vertical: "center" },
  });
  fillMerge(ws, row, 2, 7, { fill: totFill, border: BORDER_THIN });
  addMerge(merges, row - 1, 1, 7);
  row += 2;

  // ── 8. Sheet settings (fixed !ref range) ─────────────────────────────────
  ws["!merges"] = merges;
  ws["!cols"]   = COL_WIDTHS;
  // ✅ FIX: use row-1 because 'row' points to the next empty row
  const lastRow = row - 1;
  ws["!ref"]    = XLSX.utils.encode_range({ r: 0, c: 0 }, { r: lastRow, c: 7 });

  XLSX.utils.book_append_sheet(wb, ws, "Pick List");

  // ── 9. Summary sheet ─────────────────────────────────────────────────────
  XLSX.utils.book_append_sheet(
    wb,
    buildSummarySheet(order, boms, pickListNumber, printDate),
    "Summary"
  );

  XLSX.writeFile(wb, `Pick_List_-_${pickListNumber}.xlsx`);
}

// ─── Summary sheet ────────────────────────────────────────────────────────────
function buildSummarySheet(order, boms, pickListNumber, printDate) {
  const ws     = {};
  const merges = [];
  let   row    = 1;

  const HDR_S = (align = "left") => ({
    font:      { bold: true, sz: 9, color: { rgb: WHITE } },
    fill:      { patternType: "solid", fgColor: { rgb: TEAL } },
    border:    BORDER_THIN,
    alignment: { horizontal: align, vertical: "center" },
  });

  // Title
  ws[`A${row}`] = cell("Pick List Summary", {
    font: { bold: true, sz: 13, color: { rgb: TEAL } },
  });
  fillMerge(ws, row, 1, 4, {});
  addMerge(merges, row - 1, 0, 4);
  row++;

  ws[`A${row}`] = cell(
    `${pickListNumber}  |  Project: ${order?.project_name || order?.project_no || "—"}  |  Printed: ${printDate}`,
    { font: { sz: 8, color: { rgb: "888888" } } }
  );
  fillMerge(ws, row, 1, 4, {});
  addMerge(merges, row - 1, 0, 4);
  row += 2;

  // Header
  [
    ["A", "BOM Group",   "left"  ],
    ["B", "Total Items", "center"],
    ["C", "Delivered",   "center"],
    ["D", "Pending",     "center"],
    ["E", "Status",      "left"  ],
  ].forEach(([col, label, align]) => {
    ws[`${col}${row}`] = cell(label, HDR_S(align));
  });
  row++;

  // BOM rows
  boms.forEach((bom, idx) => {
    const items     = bom.items || [];
    // ⚠️ NOTE: 'deliver' field may not exist – keep original logic, but verify backend provides it.
    const delivered = items.filter((i) => i.deliver).length;
    const pending   = items.length - delivered;
    const bgFill    = idx % 2 === 1
      ? { patternType: "solid", fgColor: { rgb: ROW_ALT } }
      : { patternType: "solid", fgColor: { rgb: WHITE  } };

    const s = (align, extraFont = {}) => ({
      font:      { sz: 8.5, ...extraFont },
      fill:      bgFill,
      border:    BORDER_THIN,
      alignment: { horizontal: align, vertical: "center" },
    });

    ws[`A${row}`] = cell(bom.bom_name || "", s("left",   { bold: true }));
    ws[`B${row}`] = cell(items.length,        s("center"));
    ws[`C${row}`] = cell(delivered,           s("center", { color: { rgb: "16A34A" } }));
    ws[`D${row}`] = cell(pending,             s("center", { color: { rgb: pending > 0 ? "DC2626" : "16A34A" } }));
    ws[`E${row}`] = cell(bom.status || "—",  s("left"));
    row++;
  });

  // Totals
  row++;
  const totalItems     = boms.reduce((a, b) => a + (b.items || []).length, 0);
  const totalDelivered = boms.reduce((a, b) => a + (b.items || []).filter((i) => i.deliver).length, 0);
  const totalPending   = totalItems - totalDelivered;
  const totFill        = { patternType: "solid", fgColor: { rgb: TEAL_LIGHT } };

  const TOT_S = (align, extraFont = {}) => ({
    font:      { bold: true, sz: 9, color: { rgb: TEAL }, ...extraFont },
    fill:      totFill,
    border:    BORDER_THIN,
    alignment: { horizontal: align, vertical: "center" },
  });

  ws[`A${row}`] = cell("TOTAL",        TOT_S("left"));
  ws[`B${row}`] = cell(totalItems,     TOT_S("center"));
  ws[`C${row}`] = cell(totalDelivered, TOT_S("center", { color: { rgb: "16A34A" } }));
  ws[`D${row}`] = cell(totalPending,   TOT_S("center", { color: { rgb: totalPending > 0 ? "DC2626" : "16A34A" } }));
  ws[`E${row}`] = cell("",             TOT_S("left"));

  ws["!merges"] = merges;
  ws["!cols"]   = [{ wch: 36 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 16 }];
  const lastRow = row;
  ws["!ref"]    = XLSX.utils.encode_range({ r: 0, c: 0 }, { r: lastRow, c: 4 });

  return ws;
}