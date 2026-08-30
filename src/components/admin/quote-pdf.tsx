// Componente de documento PDF profesional para cotizaciones
// Usa @react-pdf/renderer. Colores: Navy (#1A2332) + Platinum (#C0C5CD) + Blanco.
// Estructura: Header (logo + licensed) -> Contact Block -> Customer & Project ->
// Price Breakdown -> Important Notice -> Standard Exclusions -> Terms & Conditions -> Next Steps & Signature
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer'
import fs from 'fs'
import path from 'path'

Font.registerHyphenationCallback((word) => [word])

interface QuotePDFData {
  quoteId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  projectAddress: string
  propertyType: string
  cleaningLevel: string
  sqft: number
  hasDebris: boolean
  hasStickers: boolean
  minPrice: number
  maxPrice: number
  notes?: string | null
  createdAt: string
  breakdown: {
    baseMin: number
    baseMax: number
    debrisMin: number
    debrisMax: number
    stickersMin: number
    stickersMax: number
    rateMin: number
    rateMax: number
  }
}

// Cargar el logo transparente como base64 para embeberlo en el PDF
const logoPath = path.join(process.cwd(), 'public', 'platinum-logo-pdf.png')
let logoBase64: string | null = null
try {
  if (fs.existsSync(logoPath)) {
    const buf = fs.readFileSync(logoPath)
    logoBase64 = `data:image/png;base64,${buf.toString('base64')}`
  }
} catch (e) {
  console.warn('No se pudo cargar el logo para PDF:', e)
}

const NAVY = '#1A2332'
const NAVY_LIGHT = '#243245'
const PLATINUM_BRIGHT = '#E8ECF0'
const PLATINUM = '#C0C5CD'
const PLATINUM_MID = '#9CA3AF'
const WHITE = '#FFFFFF'
const AMBER_BG = '#FFF8E7'
const AMBER_BORDER = '#D4A017'
const AMBER_TEXT = '#7A5C00'
const GRAY_BG = '#F4F6F8'
const GRAY_BORDER = '#C0C5CD'
const GRAY_TEXT = '#6B7280'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: WHITE,
    padding: 0,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: NAVY,
  },
  // ===== HEADER con logo + licensed =====
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NAVY,
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: PLATINUM,
  },
  logoImage: {
    width: 160,
    height: 50,
    marginRight: 12,
  },
  headerRight: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
  },
  quoteLabel: {
    color: PLATINUM_MID,
    fontSize: 8,
    letterSpacing: 1,
  },
  quoteNumber: {
    color: PLATINUM_BRIGHT,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  headerDate: {
    color: PLATINUM,
    fontSize: 9,
    marginTop: 4,
  },
  licensedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: PLATINUM,
  },
  licensedText: {
    color: PLATINUM_BRIGHT,
    fontSize: 7,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  // ===== Body =====
  body: {
    padding: 14,
  },
  // ===== Contact Block destacado =====
  contactBlock: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: NAVY,
    borderRadius: 5,
    marginBottom: 10,
    overflow: 'hidden',
  },
  contactLeft: {
    backgroundColor: NAVY,
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: 120,
    justifyContent: 'center',
  },
  contactLeftLabel: {
    color: PLATINUM,
    fontSize: 7,
    letterSpacing: 1,
    marginBottom: 2,
  },
  contactLeftTitle: {
    color: PLATINUM_BRIGHT,
    fontSize: 10,
    fontWeight: 'bold',
  },
  contactRight: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: GRAY_BG,
    justifyContent: 'center',
  },
  contactName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: NAVY,
    marginBottom: 1,
  },
  contactRole: {
    fontSize: 8,
    color: GRAY_TEXT,
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 9,
    color: NAVY,
    fontWeight: 'bold',
  },
  // ===== Section title =====
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: NAVY,
    marginBottom: 4,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // ===== Grid de cliente / proyecto =====
  infoGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  infoCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    borderRadius: 4,
    padding: 8,
  },
  infoCardTitle: {
    fontSize: 7,
    fontWeight: 'bold',
    color: PLATINUM_MID,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_BORDER,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  infoLabel: {
    fontSize: 8,
    color: GRAY_TEXT,
    width: 70,
  },
  infoValue: {
    fontSize: 9,
    color: NAVY,
    fontWeight: 'medium',
    flex: 1,
  },
  // ===== Price box destacada =====
  priceBox: {
    backgroundColor: GRAY_BG,
    borderWidth: 2,
    borderColor: NAVY,
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 8,
    color: NAVY,
    marginBottom: 2,
    letterSpacing: 1.5,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: NAVY,
  },
  priceRange: {
    fontSize: 9,
    color: GRAY_TEXT,
    marginTop: 3,
  },
  // ===== Tabla de desglose =====
  table: {
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    borderRadius: 4,
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: NAVY,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: PLATINUM_BRIGHT,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
  },
  colDesc: {
    flex: 2,
    fontSize: 8,
    color: NAVY,
  },
  colAmount: {
    flex: 1,
    fontSize: 8,
    color: NAVY,
    fontWeight: 'medium',
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: GRAY_BG,
  },
  // ===== Notice box (amber) =====
  noticeBox: {
    backgroundColor: AMBER_BG,
    borderWidth: 1,
    borderColor: AMBER_BORDER,
    borderRadius: 4,
    padding: 7,
    marginBottom: 7,
  },
  noticeTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: AMBER_TEXT,
    marginBottom: 2,
  },
  noticeText: {
    fontSize: 7,
    color: AMBER_TEXT,
    lineHeight: 1.3,
  },
  // ===== Exclusions box (light) =====
  exclusionsBox: {
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    borderRadius: 4,
    padding: 7,
    marginBottom: 7,
    backgroundColor: '#FAFBFC',
  },
  exclusionsTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: NAVY,
    marginBottom: 3,
  },
  exclusionItem: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  exclusionBullet: {
    fontSize: 8,
    color: PLATINUM_MID,
    marginRight: 5,
  },
  exclusionText: {
    fontSize: 7,
    color: GRAY_TEXT,
    flex: 1,
    lineHeight: 1.2,
  },
  // ===== Terms & Conditions =====
  termsBox: {
    borderWidth: 1,
    borderColor: NAVY,
    borderRadius: 4,
    padding: 7,
    marginBottom: 7,
    backgroundColor: WHITE,
  },
  termsTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: NAVY,
    marginBottom: 4,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_BORDER,
  },
  termItem: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  termLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: NAVY,
    width: 80,
  },
  termText: {
    fontSize: 7,
    color: NAVY,
    flex: 1,
    lineHeight: 1.2,
  },
  // ===== Next steps & signature =====
  nextStepsBox: {
    backgroundColor: NAVY,
    borderRadius: 4,
    padding: 7,
    marginBottom: 5,
  },
  nextStepsTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: PLATINUM_BRIGHT,
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nextStepsText: {
    fontSize: 7,
    color: PLATINUM,
    lineHeight: 1.3,
  },
  signatureBox: {
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    borderRadius: 4,
    padding: 6,
    backgroundColor: WHITE,
  },
  signatureRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  signatureField: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: NAVY,
    paddingBottom: 1,
    marginRight: 10,
    height: 16,
  },
  signatureFieldLast: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: NAVY,
    paddingBottom: 1,
    height: 16,
  },
  signatureLabel: {
    fontSize: 6,
    color: GRAY_TEXT,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // (Pie de pagina eliminado por peticion del cliente - se veia mal en blanco)
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function QuotePDF({ data }: { data: QuotePDFData }) {
  return (
    <Document
      title={`Quote ${data.quoteId} - Platinum Construction Cleaning`}
      author="Platinum Construction Cleaning"
      subject="Post-Construction Cleaning Quote"
    >
      <Page size="LETTER" style={styles.page}>
        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          {logoBase64 ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image style={styles.logoImage} src={logoBase64} />
          ) : (
            <View style={{ marginRight: 14 }}>
              <Text style={{ color: PLATINUM_BRIGHT, fontSize: 16, fontWeight: 'bold' }}>
                PLATINUM
              </Text>
              <Text style={{ color: PLATINUM, fontSize: 8 }}>
                CONSTRUCTION CLEANING
              </Text>
            </View>
          )}
          <View style={styles.headerRight}>
            <Text style={styles.quoteLabel}>QUOTE</Text>
            <Text style={styles.quoteNumber}>
              #{data.quoteId.slice(-8).toUpperCase()}
            </Text>
            <Text style={styles.headerDate}>{formatDate(data.createdAt)}</Text>
            <View style={styles.licensedBadge}>
              <Text style={styles.licensedText}>
                ★ STATE OF FLORIDA LICENSED &amp; INSURED
              </Text>
            </View>
          </View>
        </View>

        {/* ===== BODY ===== */}
        <View style={styles.body}>
          {/* ===== CONTACT BLOCK destacado ===== */}
          <View style={styles.contactBlock}>
            <View style={styles.contactLeft}>
              <Text style={styles.contactLeftLabel}>YOUR POINT OF</Text>
              <Text style={styles.contactLeftTitle}>CONTACT</Text>
            </View>
            <View style={styles.contactRight}>
              <Text style={styles.contactName}>Maria Roldan</Text>
              <Text style={styles.contactRole}>Project Manager</Text>
              <Text style={styles.contactPhone}>Direct: (786) 512-7353</Text>
            </View>
          </View>

          {/* ===== CUSTOMER & PROJECT INFO ===== */}
          <Text style={styles.sectionTitle}>Customer &amp; Project Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Customer</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{data.customerName || '—'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{data.customerPhone || '—'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{data.customerEmail || '—'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{data.projectAddress || '—'}</Text>
              </View>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Project</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Type</Text>
                <Text style={styles.infoValue}>
                  {data.propertyType === 'residential' ? 'Residential' : 'Commercial'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Service</Text>
                <Text style={styles.infoValue}>
                  {data.cleaningLevel === 'rough' ? 'Rough Clean' : 'Final Clean'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Area</Text>
                <Text style={styles.infoValue}>
                  {data.sqft.toLocaleString()} SQFT
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Extras</Text>
                <Text style={styles.infoValue}>
                  {[
                    data.hasDebris ? 'Debris Removal' : null,
                    data.hasStickers ? 'Window Stickers' : null,
                  ]
                    .filter(Boolean)
                    .join(', ') || 'None'}
                </Text>
              </View>
            </View>
          </View>

          {/* ===== PRICE BREAKDOWN ===== */}
          <Text style={styles.sectionTitle}>Estimated Price Range</Text>
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>ESTIMATED PRICE RANGE</Text>
            <Text style={styles.priceValue}>
              {formatCurrency(data.minPrice)} – {formatCurrency(data.maxPrice)}
            </Text>
            <Text style={styles.priceRange}>
              Subject to visual inspection on site
            </Text>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colDesc]}>Description</Text>
              <Text style={[styles.tableHeaderText, styles.colAmount]}>Min</Text>
              <Text style={[styles.tableHeaderText, styles.colAmount]}>Max</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.colDesc}>
                Base rate (${data.breakdown.rateMin.toFixed(2)}–
                ${data.breakdown.rateMax.toFixed(2)}/sqft × {data.sqft.toLocaleString()} sqft)
              </Text>
              <Text style={styles.colAmount}>{formatCurrency(data.breakdown.baseMin)}</Text>
              <Text style={styles.colAmount}>{formatCurrency(data.breakdown.baseMax)}</Text>
            </View>
            {data.hasDebris && (
              <View style={styles.tableRow}>
                <Text style={styles.colDesc}>Debris removal</Text>
                <Text style={styles.colAmount}>{formatCurrency(data.breakdown.debrisMin)}</Text>
                <Text style={styles.colAmount}>{formatCurrency(data.breakdown.debrisMax)}</Text>
              </View>
            )}
            {data.hasStickers && (
              <View style={styles.tableRow}>
                <Text style={styles.colDesc}>Window sticker removal</Text>
                <Text style={styles.colAmount}>{formatCurrency(data.breakdown.stickersMin)}</Text>
                <Text style={styles.colAmount}>{formatCurrency(data.breakdown.stickersMax)}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={[styles.colDesc, { fontWeight: 'bold', color: NAVY }]}>
                Total Estimated Range
              </Text>
              <Text style={[styles.colAmount, { fontWeight: 'bold', color: NAVY, fontSize: 11 }]}>
                {formatCurrency(data.minPrice)}
              </Text>
              <Text style={[styles.colAmount, { fontWeight: 'bold', color: NAVY, fontSize: 11 }]}>
                {formatCurrency(data.maxPrice)}
              </Text>
            </View>
          </View>

          {/* ===== IMPORTANT NOTICE ===== */}
          <View style={styles.noticeBox}>
            <Text style={styles.noticeTitle}>
              IMPORTANT NOTICE — Subject to Inspection
            </Text>
            <Text style={styles.noticeText}>
              This document is a referential estimate subject to visual inspection
              on site. Final pricing may vary based on actual site conditions,
              accessibility, and the scope of work identified during the on-site
              evaluation. No price is considered final or binding until a visual
              inspection has been completed and a formal agreement has been signed
              by both parties.
            </Text>
          </View>

          {/* ===== STANDARD EXCLUSIONS ===== */}
          <View style={styles.exclusionsBox}>
            <Text style={styles.exclusionsTitle}>
              Standard Exclusions (Unless Otherwise Quoted)
            </Text>
            <View style={styles.exclusionItem}>
              <Text style={styles.exclusionBullet}>•</Text>
              <Text style={styles.exclusionText}>
                Removal of construction dumpsters or large debris left by other trades.
              </Text>
            </View>
            <View style={styles.exclusionItem}>
              <Text style={styles.exclusionBullet}>•</Text>
              <Text style={styles.exclusionText}>
                Cleaning of exterior glass surfaces above the first floor.
              </Text>
            </View>
            <View style={styles.exclusionItem}>
              <Text style={styles.exclusionBullet}>•</Text>
              <Text style={styles.exclusionText}>
                Scrubbing of heavily painted or stained concrete floors (requires separate quote).
              </Text>
            </View>
          </View>

          {/* ===== TERMS & CONDITIONS ===== */}
          <View style={styles.termsBox}>
            <Text style={styles.termsTitle}>Terms &amp; Conditions</Text>
            <View style={styles.termItem}>
              <Text style={styles.termLabel}>Validity</Text>
              <Text style={styles.termText}>
                This estimate is valid for 30 days from the date of issue.
              </Text>
            </View>
            <View style={styles.termItem}>
              <Text style={styles.termLabel}>Payment Terms</Text>
              <Text style={styles.termText}>
                A 50% deposit is required to schedule the project. The remaining balance is due immediately upon completion of the work.
              </Text>
            </View>
            <View style={styles.termItem}>
              <Text style={styles.termLabel}>Scope of Work</Text>
              <Text style={styles.termText}>
                The final scope of work will be determined during the mandatory on-site visual inspection.
              </Text>
            </View>
            <View style={styles.termItem}>
              <Text style={styles.termLabel}>Exclusions</Text>
              <Text style={styles.termText}>
                This estimate does not include the removal of hazardous materials, exterior window cleaning, or heavy debris left by subcontractors (unless specified above).
              </Text>
            </View>
            <View style={[styles.termItem, { marginBottom: 0 }]}>
              <Text style={styles.termLabel}>Cancellation</Text>
              <Text style={styles.termText}>
                Cancellations made within 24 hours of the scheduled service may incur a cancellation fee.
              </Text>
            </View>
          </View>

          {/* ===== NEXT STEPS & SIGNATURE ===== */}
          <View style={styles.nextStepsBox}>
            <Text style={styles.nextStepsTitle}>Next Steps</Text>
            <Text style={styles.nextStepsText}>
              To approve this estimated range and schedule your free on-site inspection, please sign below. A final binding quote will be provided after the walk-through.
            </Text>
          </View>

          <View style={styles.signatureBox}>
            <View style={styles.signatureRow}>
              <View style={styles.signatureField}>
                <Text style={styles.signatureLabel}>Authorized Signature</Text>
              </View>
              <View style={styles.signatureFieldLast}>
                <Text style={styles.signatureLabel}>Date</Text>
              </View>
            </View>
            <View style={styles.signatureRow}>
              <View style={styles.signatureFieldLast}>
                <Text style={styles.signatureLabel}>Print Name</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}

export type { QuotePDFData }
