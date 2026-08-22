import { Document, Page, View, Text, Image, StyleSheet, Svg, Defs, LinearGradient, Stop, Rect } from "@react-pdf/renderer";
import { CONTACT, CONTACT_ADDRESS_FULL, SITE_NAME } from "@/lib/site";

export type VendorBillingLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export type VendorBillingData = {
  mode: "quote" | "invoice";
  orderCode: string;
  eventDate: string;
  eventTime: string;
  venueName: string | null;
  venueLine1: string;
  venueLine2: string | null;
  venueCity: string;
  venuePincode: string;
  vendorBusinessName: string;
  vendorContactName: string;
  vendorPhone: string;
  items: VendorBillingLineItem[];
  total: number;
  paidAt: string | null;
};

const PURPLE = "#45008c";
const PINK = "#ff307e";
const INK = "#211538";
const MUTED = "#746c85";
const BORDER = "#e6e0f0";
const SOFT = "#faf8fd";

// pdfkit's standard fonts only support WinAnsiEncoding (no ₹ glyph — it
// postdates that encoding), so amounts use "Rs." rather than the rupee
// sign to avoid a missing-glyph box in the rendered PDF.
function money(n: number): string {
  return `Rs. ${n.toLocaleString("en-IN")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const styles = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 56, paddingHorizontal: 44, fontSize: 9.5, color: INK, fontFamily: "Helvetica" },
  headerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  logo: { width: 58, height: 58 },
  headerRight: { alignItems: "flex-end" },
  eyebrow: { fontSize: 8, fontFamily: "Helvetica-Bold", letterSpacing: 1.5, color: PINK },
  genDate: { fontSize: 8, color: MUTED, marginTop: 2 },
  gradientBar: { marginTop: 16, marginBottom: 20 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  title: { fontSize: 21, fontFamily: "Helvetica-Bold" },
  refCode: { fontSize: 11, fontFamily: "Helvetica-Bold", color: PURPLE, marginTop: 3 },
  paidPill: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#0a7a4d",
    backgroundColor: "#e6f7ef",
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 10,
  },
  disclaimer: { marginTop: 18, padding: 12, borderRadius: 6, backgroundColor: "#fff1f6", borderLeftWidth: 3, borderLeftColor: PINK },
  disclaimerTitle: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: "#c20050", marginBottom: 3 },
  disclaimerBody: { fontSize: 8.5, color: "#5c3345", lineHeight: 1.45 },
  infoRow: { flexDirection: "row", gap: 12, marginTop: 18 },
  infoBox: { flex: 1, borderWidth: 1, borderColor: BORDER, borderRadius: 8, padding: 12 },
  infoLabel: { fontSize: 7.5, fontFamily: "Helvetica-Bold", letterSpacing: 1, color: MUTED, marginBottom: 6 },
  infoValue: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  infoSub: { fontSize: 8.5, color: MUTED, marginTop: 2, lineHeight: 1.4 },
  sectionLabel: { fontSize: 7.5, fontFamily: "Helvetica-Bold", letterSpacing: 1, color: MUTED, marginTop: 22, marginBottom: 8 },
  table: { borderWidth: 1, borderColor: BORDER, borderRadius: 8, overflow: "hidden" },
  tableHead: { flexDirection: "row", backgroundColor: SOFT, paddingVertical: 7, paddingHorizontal: 10 },
  tableRow: { flexDirection: "row", paddingVertical: 8, paddingHorizontal: 10, borderTopWidth: 1, borderTopColor: BORDER },
  th: { fontSize: 7.5, fontFamily: "Helvetica-Bold", letterSpacing: 0.5, color: MUTED },
  colService: { flex: 1, paddingRight: 8 },
  colQty: { width: 34, textAlign: "center" },
  colUnit: { width: 74, textAlign: "right" },
  colTotal: { width: 74, textAlign: "right" },
  itemName: { fontSize: 9.5, fontFamily: "Helvetica-Bold" },
  cellText: { fontSize: 9.5 },
  cellTextBold: { fontSize: 9.5, fontFamily: "Helvetica-Bold" },
  totalsRow: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginTop: 14, gap: 10 },
  totalsLabel: { fontSize: 10, color: MUTED },
  totalsValue: { fontSize: 17, fontFamily: "Helvetica-Bold", color: PURPLE },
  footer: { position: "absolute", left: 44, right: 44, bottom: 30, borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 10 },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  footerBrand: { fontSize: 9, fontFamily: "Helvetica-Bold", color: PURPLE },
  footerLine: { fontSize: 7.5, color: MUTED, marginTop: 1.5 },
  pageNum: { fontSize: 7.5, color: MUTED },
});

function GradientBar() {
  return (
    <View style={styles.gradientBar}>
      <Svg height={3} width="100%">
        <Defs>
          <LinearGradient id="brandBar" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={PURPLE} />
            <Stop offset="1" stopColor={PINK} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width="100%" height={3} fill="url(#brandBar)" />
      </Svg>
    </View>
  );
}

export function VendorBillingDocument({ data, logoSrc }: { data: VendorBillingData; logoSrc: string }) {
  const isInvoice = data.mode === "invoice";
  const venueLine = [data.venueLine1, data.venueLine2].filter(Boolean).join(", ");

  return (
    <Document
      title={`${isInvoice ? "Invoice" : "Quotation"} — #${data.orderCode}`}
      author={data.vendorBusinessName}
      subject={isInvoice ? "Vendor invoice" : "Vendor quotation"}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image has no alt prop */}
          <Image src={logoSrc} style={styles.logo} />
          <View style={styles.headerRight}>
            <Text style={styles.eyebrow}>{isInvoice ? "INVOICE" : "QUOTATION"}</Text>
            <Text style={styles.genDate}>Generated {formatDate(new Date().toISOString())}</Text>
          </View>
        </View>

        <GradientBar />

        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>{isInvoice ? "Invoice" : "Vendor quotation"}</Text>
            <Text style={styles.refCode}>Ref #{data.orderCode}</Text>
          </View>
          {isInvoice && <Text style={styles.paidPill}>PAID{data.paidAt ? ` · ${formatDate(data.paidAt)}` : ""}</Text>}
        </View>

        {!isInvoice && (
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerTitle}>This is a quotation, pending confirmation</Text>
            <Text style={styles.disclaimerBody}>
              Pricing below is what {data.vendorBusinessName} is proposing for this job. A final invoice will
              follow once the amount is confirmed and payment is settled.
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>FROM</Text>
            <Text style={styles.infoValue}>{data.vendorBusinessName}</Text>
            <Text style={styles.infoSub}>
              {data.vendorContactName}
              {"\n"}
              {data.vendorPhone}
            </Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>EVENT</Text>
            <Text style={styles.infoValue}>{formatDate(data.eventDate)}</Text>
            <Text style={styles.infoSub}>
              {data.eventTime}
              {"\n"}
              {data.venueName ? `${data.venueName}, ` : ""}
              {venueLine}, {data.venueCity} — {data.venuePincode}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>{isInvoice ? "BILLED FOR" : "QUOTED FOR"}</Text>
        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.th, styles.colService]}>DESCRIPTION</Text>
            <Text style={[styles.th, styles.colQty]}>QTY</Text>
            <Text style={[styles.th, styles.colUnit]}>UNIT PRICE</Text>
            <Text style={[styles.th, styles.colTotal]}>TOTAL</Text>
          </View>
          {data.items.map((it, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.itemName, styles.colService]}>{it.description}</Text>
              <Text style={[styles.cellText, styles.colQty]}>{it.quantity}</Text>
              <Text style={[styles.cellText, styles.colUnit]}>{money(it.unitPrice)}</Text>
              <Text style={[styles.cellTextBold, styles.colTotal]}>{money(it.quantity * it.unitPrice)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>{isInvoice ? "Total paid" : "Quoted total"}</Text>
          <Text style={styles.totalsValue}>{money(data.total)}</Text>
        </View>

        <View style={styles.footer} fixed>
          <View style={styles.footerRow}>
            <View>
              <Text style={styles.footerBrand}>{SITE_NAME}</Text>
              <Text style={styles.footerLine}>{CONTACT_ADDRESS_FULL}</Text>
              <Text style={styles.footerLine}>
                {CONTACT.phone} · {CONTACT.email}
              </Text>
            </View>
            <Text style={styles.pageNum} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
        </View>
      </Page>
    </Document>
  );
}
