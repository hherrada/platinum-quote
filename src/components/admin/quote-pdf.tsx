// Componente de documento PDF profesional para cotizaciones
// Usa @react-pdf/renderer. El contenido esta en INGLES.
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

// Registrar fuentes (usamos Helvetica que viene por defecto en PDF)
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

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 0,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1f2937',
  },
  // Header con banda de color
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#047857',
    padding: 24,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#047857',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#a7f3d0',
    fontSize: 9,
    marginTop: 2,
  },
  headerRight: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
  },
  quoteLabel: {
    color: '#a7f3d0',
    fontSize: 8,
    letterSpacing: 1,
  },
  quoteNumber: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  // Cuerpo
  body: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#047857',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Grid de cliente / proyecto
  infoGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 8,
    color: '#6b7280',
    width: 80,
  },
  infoValue: {
    fontSize: 9,
    color: '#111827',
    fontWeight: 'medium',
    flex: 1,
  },
  // Caja de precio destacada
  priceBox: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1.5,
    borderColor: '#047857',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 10,
    color: '#047857',
    marginBottom: 6,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#065f46',
  },
  priceRange: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  // Tabla de desglose
  table: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  colDesc: {
    flex: 2,
    fontSize: 9,
    color: '#374151',
  },
  colAmount: {
    flex: 1,
    fontSize: 9,
    color: '#111827',
    fontWeight: 'medium',
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#ecfdf5',
  },
  // Disclaimer
  disclaimerBox: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fcd34d',
    borderRadius: 6,
    padding: 12,
    marginBottom: 20,
  },
  disclaimerTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 8,
    color: '#78350f',
    lineHeight: 1.4,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerLeft: {
    fontSize: 8,
    color: '#6b7280',
  },
  footerRight: {
    fontSize: 8,
    color: '#6b7280',
  },
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>P</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Platinum Construction Cleaning</Text>
            <Text style={styles.headerSubtitle}>
              Post-Construction Cleaning Services · Florida
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.quoteLabel}>QUOTE</Text>
            <Text style={styles.quoteNumber}>
              #{data.quoteId.slice(-8).toUpperCase()}
            </Text>
            <Text style={styles.headerSubtitle}>
              {formatDate(data.createdAt)}
            </Text>
          </View>
        </View>

        {/* Cuerpo */}
        <View style={styles.body}>
          {/* Cliente y proyecto */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Customer</Text>
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
              <Text style={styles.sectionTitle}>Project</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Type</Text>
                <Text style={styles.infoValue}>
                  {data.propertyType === 'residential'
                    ? 'Residential'
                    : 'Commercial'}
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

          {/* Caja de precio */}
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>ESTIMATED PRICE RANGE</Text>
            <Text style={styles.priceValue}>
              {formatCurrency(data.minPrice)} – {formatCurrency(data.maxPrice)}
            </Text>
            <Text style={styles.priceRange}>
              Subject to visual inspection on site
            </Text>
          </View>

          {/* Tabla de desglose */}
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colDesc]}>
                Description
              </Text>
              <Text style={[styles.tableHeaderText, styles.colAmount]}>
                Min
              </Text>
              <Text style={[styles.tableHeaderText, styles.colAmount]}>
                Max
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.colDesc}>
                Base rate (${data.breakdown.rateMin.toFixed(2)}–
                ${data.breakdown.rateMax.toFixed(2)}/sqft × {data.sqft.toLocaleString()} sqft)
              </Text>
              <Text style={styles.colAmount}>
                {formatCurrency(data.breakdown.baseMin)}
              </Text>
              <Text style={styles.colAmount}>
                {formatCurrency(data.breakdown.baseMax)}
              </Text>
            </View>
            {data.hasDebris && (
              <View style={styles.tableRow}>
                <Text style={styles.colDesc}>Debris removal</Text>
                <Text style={styles.colAmount}>
                  {formatCurrency(data.breakdown.debrisMin)}
                </Text>
                <Text style={styles.colAmount}>
                  {formatCurrency(data.breakdown.debrisMax)}
                </Text>
              </View>
            )}
            {data.hasStickers && (
              <View style={styles.tableRow}>
                <Text style={styles.colDesc}>Window sticker removal</Text>
                <Text style={styles.colAmount}>
                  {formatCurrency(data.breakdown.stickersMin)}
                </Text>
                <Text style={styles.colAmount}>
                  {formatCurrency(data.breakdown.stickersMax)}
                </Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={[styles.colDesc, { fontWeight: 'bold', color: '#065f46' }]}>
                Total Estimated Range
              </Text>
              <Text
                style={[
                  styles.colAmount,
                  { fontWeight: 'bold', color: '#065f46', fontSize: 11 },
                ]}
              >
                {formatCurrency(data.minPrice)}
              </Text>
              <Text
                style={[
                  styles.colAmount,
                  { fontWeight: 'bold', color: '#065f46', fontSize: 11 },
                ]}
              >
                {formatCurrency(data.maxPrice)}
              </Text>
            </View>
          </View>

          {/* Notas */}
          {data.notes && (
            <View style={[styles.infoCard, { marginBottom: 16 }]}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={{ fontSize: 9, color: '#374151' }}>{data.notes}</Text>
            </View>
          )}

          {/* Disclaimer */}
          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerTitle}>
              ⚠ Important Notice — Subject to Inspection
            </Text>
            <Text style={styles.disclaimerText}>
              This document is a referential estimate subject to visual inspection
              on site. Final pricing may vary based on actual site conditions,
              accessibility, and the scope of work identified during the on-site
              evaluation. No price is considered final or binding until a visual
              inspection has been completed and a formal agreement has been signed
              by both parties.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerLeft}>
            Platinum Construction Cleaning · (305) 555-0192 ·
            info@platinumcleaning.com
          </Text>
          <Text style={styles.footerRight}>
            Quote #{data.quoteId.slice(-8).toUpperCase()} · Page 1 of 1
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export type { QuotePDFData }
