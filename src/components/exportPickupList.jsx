/**
 * ExportPickList.jsx
 * Generates a PDF pick list — pixel-perfect match to IMS Maco Services format.
 * Uses @react-pdf/renderer
 *
 * Install: npm install @react-pdf/renderer
 *
 * Usage:
 *   import { generatePickListPDF } from "./ExportPickList";
 *   generatePickListPDF(order);
 */

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Line,
  Svg,
} from "@react-pdf/renderer";

// ─── Design tokens ────────────────────────────────────────────────────────────
const TEAL        = "#017e84";
const TEAL_LIGHT  = "#f0fafa";
const TEAL_BORDER = "#c8e6e8";
const GRAY_BG     = "#f9fafb";
const GRAY_BORDER = "#e5e7eb";
const GRAY_TEXT   = "#6b7280";
const DARK_TEXT   = "#111111";
const MED_TEXT    = "#444444";
const LIGHT_TEXT  = "#888888";
const ALT_ROW     = "#fafafa";
const WHITE       = "#ffffff";

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingBottom: 44,
    paddingHorizontal: 28,
    fontSize: 8,
    fontFamily: "Helvetica",
    color: DARK_TEXT,
    backgroundColor: WHITE,
  },

  // ── Header ──────────────────────────────────────────────
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 0,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_BORDER,
  },
  companyBlock: {
    flex: 1,
    paddingRight: 16,
  },
  companyName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: DARK_TEXT,
    marginBottom: 3,
  },
  companyDetail: {
    fontSize: 7,
    color: "#555555",
    lineHeight: 1.55,
  },

  // Right side of header
  docBlock: {
    alignItems: "flex-end",
    minWidth: 200,
  },
  docTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: DARK_TEXT,
    marginBottom: 6,
    alignSelf: "flex-end",
  },

  // Meta table inside header (Pick List number / Date / Project No)
  docMetaTable: {
    flexDirection: "row",
    marginTop: 4,
    //     borderBottomWidth: 1,
    // borderBottomColor: GRAY_BORDER,
  },
  docMetaLabels: {
    flexDirection: "column",
    marginRight: 2,
  },
  docMetaValues: {
    flexDirection: "column",
  },
  docMetaLabel: {
    fontSize: 7.5,
    color: DARK_TEXT,
    fontFamily: "Helvetica",
    lineHeight: 1.8,
  },
  docMetaValue: {
    fontSize: 7.5,
    color: DARK_TEXT,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.8,
  },

  // ── Table ────────────────────────────────────────────────
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: GRAY_BORDER,
    paddingVertical: 5,
    paddingHorizontal: 0,
    marginTop: 10,
  },
  thText: {
    fontSize: 7,
    fontFamily: "Helvetica",
    color: GRAY_TEXT,
  },

  // Column widths — must sum to available width (~536pt for A4 with 28pt margins each side)
  colProduct:     { flex: 1, paddingRight: 4 },
  colLocSub:      { width: 150, flexDirection: "row" },
  colLocation:    { width: 72, paddingRight: 4 },
  colSublocation: { width: 78 },
  colQtyBom:      { width: 52, textAlign: "right", alignItems: "flex-end" },
  colQtyPickup:   { width: 52, textAlign: "right", alignItems: "flex-end" },

  // ── Item rows ────────────────────────────────────────────
  itemRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "flex-start",
  },
  itemRowAlt: {
    backgroundColor: ALT_ROW,
  },
  itemName: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: DARK_TEXT,
    marginBottom: 1,
    lineHeight: 1.35,
  },
  itemArticle: {
    fontSize: 7,
    color: "#555555",
    fontFamily: "Helvetica",
    lineHeight: 1.3,
  },

  // Location pill (rounded chip like PDF)
  locationPill: {
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginTop: 1,
  },
  locationPillText: {
    fontSize: 7,
    color: MED_TEXT,
    fontFamily: "Helvetica",
  },
  sublocationText: {
    fontSize: 7,
    color: MED_TEXT,
    fontFamily: "Helvetica",
    marginTop: 3,
    paddingLeft: 2,
  },

  // Qty BOM — bold + "Nos" unit
  qtyBomText: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: DARK_TEXT,
    textAlign: "right",
  },

  // Qty Pickup — empty box
  qtyPickupBox: {
    width: 38,
    height: 14,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 2,
    backgroundColor: GRAY_BG,
    alignSelf: "flex-end",
  },

  // ── BOM group header ─────────────────────────────────────
  bomGroupRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: TEAL_LIGHT,
    borderLeftWidth: 3,
    borderLeftColor: TEAL,
    borderBottomWidth: 1,
    borderBottomColor: TEAL_BORDER,
    marginTop: 4,
  },
  bomGroupName: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: TEAL,
  },
  bomGroupCount: {
    fontSize: 7,
    color: LIGHT_TEXT,
    marginLeft: 5,
  },

  // ── Remarks ──────────────────────────────────────────────
  remarksRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    marginBottom: 4,
    gap: 4,
  },
  remarkChip: {
    backgroundColor: "#fef9c3",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  remarkText: {
    fontSize: 7,
    color: "#92400e",
    fontFamily: "Helvetica",
  },

  // ── Signature area ───────────────────────────────────────
  signatureArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28,
    paddingTop: 0,
  },
  signatureBox: {
    width: "30%",
    borderTopWidth: 1,
    borderTopColor: "#cccccc",
    paddingTop: 4,
    alignItems: "center",
  },
  signatureLabel: {
    fontSize: 7,
    color: LIGHT_TEXT,
    fontFamily: "Helvetica",
    textAlign: "center",
  },

  // ── Footer (fixed) ───────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 16,
    left: 28,
    right: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: GRAY_BORDER,
    paddingTop: 5,
  },
  footerUrl: {
    fontSize: 6.5,
    color: "#aaaaaa",
    fontFamily: "Helvetica",
  },
  footerPage: {
    fontSize: 6.5,
    color: "#666666",
    fontFamily: "Helvetica-Bold",
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

// Divider line between header and table (full width teal rule)
const TealRule = () => (
  <Svg height={2} style={{ marginTop: 0, marginBottom: 0 }}>
    <Line x1={0} y1={1} x2={600} y2={1} strokeWidth={1} stroke={TEAL_BORDER} />
  </Svg>
);

// Location + sublocation cell pair (side-by-side like PDF: "Workshop | No sublocation")
const LocationCell = ({ location, sublocation }) => (
  <View style={S.colLocSub}>
    {/* Location pill */}
    <View style={[S.colLocation, { justifyContent: "flex-start" }]}>
      <View style={S.locationPill}>
        <Text style={S.locationPillText}>{location || "Workshop"}</Text>
      </View>
    </View>
    {/* Sublocation text */}
    <View style={[S.colSublocation, { justifyContent: "flex-start" }]}>
      <Text style={S.sublocationText}>{sublocation || "No sublocation"}</Text>
    </View>
  </View>
);

// ─── PDF Document ─────────────────────────────────────────────────────────────
const PickListDocument = ({ order }) => {
  const boms           = order?.boms || [];
  const pickListNumber = `MO-${order?.id || ""}`;
  const projectNo      = order?.project_name || order?.project_no || "—";
  const requisitionNo  = order?.requisition_no || `REQ-${order?.id || ""}`;
  const printDate      = formatDate(new Date());
  const docDate        = formatDate(order?.requisition_date) || printDate;

  const remarks = (order?.remarks || []).map((r) =>
    typeof r === "string" ? r : r.text
  );

  const sourceUrl =
    order?.source_url ||
    `https://app.inflowinventory.com/manufacturing-orders/${order?.uuid || order?.id}`;

  return (
    <Document
      title={`Pick List - ${pickListNumber}`}
      author="IMS Maco Services Pvt Ltd"
      subject="Manufacture Pick List"
    >
      <Page size="A4" style={S.page}>

        {/* ═══════════════════════════════════════════════════
            HEADER — company left, doc info right
        ═══════════════════════════════════════════════════ */}
        <View style={S.headerRow}>
          {/* Left: company block */}
          <View style={S.companyBlock}>
            <Text style={S.companyName}>IMS Maco Services Pvt Ltd</Text>
            <Text style={S.companyDetail}>
              {"2/5, Sarat Bose Road , Sukhsagar ,\n"}
              {"8th Floor , Flat - 8C\n"}
              {"Kolkata , West Bengal\n"}
              {"700020 India\n"}
              {"GSTIN: 19AABCI4711Q1Z7  PAN. : AACCM8740L\n"}
              {"www.ims-gmbh.de  |  info-india@ims-gmbh.de\n"}
              {"+91 33 4084 4100"}
            </Text>
          </View>

          {/* Right: doc title + meta */}
          <View style={S.docBlock}>
            <Text style={S.docTitle}>Manufacture pick list</Text>

            {/* Pick List number / Date / Project No — two-column label:value */}
            <View style={S.docMetaTable}>
              <View style={S.docMetaLabels}>
                <Text style={S.docMetaLabel}>Pick List number</Text>
                <Text style={S.docMetaLabel}>Date</Text>
                <Text style={S.docMetaLabel}>Project No</Text>
              </View>
              <View style={S.docMetaValues}>
                <Text style={S.docMetaValue}>{pickListNumber}</Text>
                <Text style={S.docMetaValue}>{docDate}</Text>
                <Text style={S.docMetaValue}>{projectNo}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════
            REMARKS (if any)
        ═══════════════════════════════════════════════════ */}
        {remarks.length > 0 && (
          <View style={S.remarksRow}>
            {remarks.map((r, i) => (
              <View key={i} style={S.remarkChip}>
                <Text style={S.remarkText}>{r}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ═══════════════════════════════════════════════════
            TABLE HEADER
        ═══════════════════════════════════════════════════ */}
        <View style={S.tableHeader}>
          <View style={S.colProduct}>
            <Text style={S.thText}>Product</Text>
          </View>
          {/* Combined "Location & sublocation" header spanning both sub-cols */}
          <View style={S.colLocSub}>
            <Text style={S.thText}>Location &amp; sublocation</Text>
          </View>
          <View style={S.colQtyBom}>
            <Text style={[S.thText, { textAlign: "right" }]}>Qty Bom</Text>
          </View>
          <View style={S.colQtyPickup}>
            <Text style={[S.thText, { textAlign: "right" }]}>Qty Pickup</Text>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════
            TABLE BODY — BOMs → Items
        ═══════════════════════════════════════════════════ */}
        {boms.map((bom, bomIdx) => (
          <View key={bom.bom_id || bomIdx}>

            {/* BOM group header (only when multiple BOMs) */}
            {/* {boms.length > 1 && (
              <View style={S.bomGroupRow}>
                <Text style={S.bomGroupName}>{bom.bom_name}</Text>
                <Text style={S.bomGroupCount}>
                  ({(bom.items || []).length} items)
                </Text>
              </View>
            )} */}

            {(bom.items || []).map((item, idx) => {
              const articleNo =
                item.article_no && item.article_no !== item.product_name
                  ? item.article_no
                  : null;

              return (
                <View
                  key={`${bom.bom_id || bomIdx}-${idx}`}
                  style={[S.itemRow, idx % 2 === 1 ? S.itemRowAlt : {}]}
                  wrap={false}
                >
                  {/* Product name + article no (smaller, grey below) */}
                  <View style={S.colProduct}>
                    <Text style={S.itemName}>{item.product_name}</Text>
                    {articleNo && (
                      <Text style={S.itemArticle}>{articleNo}</Text>
                    )}
                  </View>

                  {/* Location pill + sublocation text */}
                  <LocationCell
                    location={item.location}
                    sublocation={item.sublocation}
                  />

                  {/* Qty BOM */}
                  <View style={[S.colQtyBom, { justifyContent: "flex-start", paddingTop: 1 }]}>
                    <Text style={S.qtyBomText}>
                      {item.qty} {item.uom_name || "Nos"}
                    </Text>
                  </View>

                  {/* Qty Pickup — blank box */}
                  <View style={[S.colQtyPickup, { justifyContent: "flex-start", paddingTop: 1 }]}>
                    {/* <View style={S.qtyPickupBox} /> */}
                     <Text style={S.qtyBomText}>
                      {item.pick_qty} 
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        {/* ═══════════════════════════════════════════════════
            SIGNATURE AREA
        ═══════════════════════════════════════════════════ */}
        {/* <View style={S.signatureArea}>
          {["Prepared By", "Checked By", "Approved By"].map((label) => (
            <View key={label} style={S.signatureBox}>
              <Text style={S.signatureLabel}>{label}</Text>
            </View>
          ))}
        </View> */}

        {/* ═══════════════════════════════════════════════════
            FOOTER (fixed — appears on every page)
        ═══════════════════════════════════════════════════ */}
        <View style={S.footer} fixed>
          {/* <Text style={S.footerUrl}>{sourceUrl}</Text> */}
          <Text
            style={S.footerPage}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber}/${totalPages}`
            }
          />
        </View>

      </Page>
    </Document>
  );
};

// ─── Trigger browser download ─────────────────────────────────────────────────
export async function generatePickListPDF(order) {
  try {
    const pickListNumber = `MO-${order?.id || ""}`;
    const blob = await pdf(<PickListDocument order={order} />).toBlob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `Pick_List_-_${pickListNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("PDF generation failed:", err);
    throw err;
  }
}

export { PickListDocument };
export default PickListDocument;