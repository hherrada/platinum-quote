// Componente de documento PDF profesional para cotizaciones
// Usa @react-pdf/renderer. Colores: Navy (#1A2332) + Platinum (#C0C5CD) + Blanco.
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

// Cargar el logo como base64 para embeberlo en el PDF
const logoPath = path.join(process.cwd(), 'public', 'platinum-logo.png')
let logoBase64: string | null = null
try {
  if (fs.existsSync(logoPath)) {
    const buf = fs.readFileSync(logoPath)
    logoBase64 = `data:image/png;base64,${buf.toString('base64')}`
  }
} catch (e) {
  console.warn('No se pudo cargar el logo para PDF:', e)
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 0,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1A2332',
  },
  // Header con fondo navy oscuro
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2332',
    padding: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#C0C5CD',
  },
  logoImage: {
    width: 200,
    height: 62,
    marginRight: 14,
  },
  headerTitle: {
    color: '#E8ECF0',
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#9CA3AF',
    fontSize: 9,
    marginTop: 2,
  },
  headerRight: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
  },
  quoteLabel: {
    color: '#9CA3AF',
    fontSize: 8,
    letterSpacing: 1,
  },
  quoteNumber: {
    color: '#E8ECF0',
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
    color: '#1A2332',
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
    borderColor: '#C0C5CD',
    borderRadius: 6,
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 8,
    color: '#6B7280',
    width: 80,
  },
  infoValue: {
    fontSize: 9,
    color: '#1A2332',
    fontWeight: 'medium',
    flex: 1,
  },
  // Caja de precio destacada con acentos platinum
  priceBox: {
    backgroundColor: '#F4F6F8',
    borderWidth: 2,
    borderColor: '#1A2332',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 10,
    color: '#1A2332',
    marginBottom: 6,
    letterSpacing: 1,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A2332',
  },
  priceRange: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
  },
  // Tabla de desglose
  table: {
    borderWidth: 1,
    borderColor: '#C0C5CD',
    borderRadius: 6,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1A2332',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#E8ECF0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
  },
  colDesc: {
    flex: 2,
    fontSize: 9,
    color: '#1A2332',
  },
  colAmount: {
    flex: 1,
    fontSize: 9,
    color: '#1A2332',
    fontWeight: 'medium',
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F4F6F8',
  },
  // Disclaimer
  disclaimerBox: {
    backgroundColor: '#FFF8E7',
    borderWidth: 1,
    borderColor: '#D4A017',
    borderRadius: 6,
    padding: 12,
    marginBottom: 20,
  },
  disclaimerTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#7A5C00',
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 8,
    color: '#5A4500',
    lineHeight: 1.4,
  },
  // Footer con fondo navy
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1A2332',
    paddingVertical: 10,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#C0C5CD',
  },
  footerLeft: {
    fontSize: 8,
    color: '#C0C5CD',
  },
  footerRight: {
    fontSize: 8,
    color: '#9CA3AF',
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
        {/* Header con logo y fondo navy */}
        <View style={styles.header}>
          {logoBase64 ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image style={styles.logoImage} src={logoBase64} />
          ) : (
            <View style={{ marginRight: 14 }}>
              <Text style={styles.headerTitle}>PLATINUM</Text>
              <Text style={styles.headerSubtitle}>CONSTRUCTION CLEANING</Text>
            </View>
          )}
          <View style={styles.headerRight}>
            <Text style={styles.quoteLabel}>QUOTE</Text>
            <Text style={styles.quoteNumber}>
              #{data.quoteId.slice(-8).toUpperCase()}
            </Text>
            <Text style={[styles.headerSubtitle, { marginTop: 4 }]}>
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
              <Text style={[styles.colDesc, { fontWeight: 'bold', color: '#1A2332' }]}>
                Total Estimated Range
              </Text>
              <Text
                style={[
                  styles.colAmount,
                  { fontWeight: 'bold', color: '#1A2332', fontSize: 11 },
                ]}
              >
                {formatCurrency(data.minPrice)}
              </Text>
              <Text
                style={[
                  styles.colAmount,
                  { fontWeight: 'bold', color: '#1A2332', fontSize: 11 },
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
              <Text style={{ fontSize: 9, color: '#1A2332' }}>{data.notes}</Text>
            </View>
          )}

          {/* Disclaimer */}
          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerTitle}>
              Important Notice — Subject to Inspection
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

        {/* Footer con fondo navy */}
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
