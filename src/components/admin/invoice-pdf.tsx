// Componente de documento PDF profesional para FACTURAS (Invoice)
// Usa @react-pdf/renderer. Colores: Navy (#1A2332) + Platinum (#C0C5CD) + Blanco.
// Estructura: Header (logo) -> Customer + Invoice meta -> Service + Amounts ->
// Deposit Notice (if isDeposit) -> Payment Instructions -> Terms -> Signature
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

interface InvoicePDFData {
  invoiceNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  projectAddress: string
  propertyType: string
  cleaningLevel: string
  sqft: number
  hasDebris: boolean
  hasStickers: boolean
  totalAmount: number
  amountDue: number
  isDeposit: boolean
  issueDate: string
  dueDate: string
  status: string
  notes?: string | null
}

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
const EMERALD = '#059669'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: WHITE,
    padding: 0,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: NAVY,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NAVY,
    padding: 12,
    borderBottomWidth: 2,
    borderBottomColor: PLATINUM,
  },
  logoImage: { width: 160, height: 50, marginRight: 12 },
  headerRight: { marginLeft: 'auto', alignItems: 'flex-end' },
  invoiceLabel: { color: PLATINUM_MID, fontSize: 8, letterSpacing: 1 },
  invoiceNumber: { color: PLATINUM_BRIGHT, fontSize: 13, fontWeight: 'bold', marginTop: 2 },
  headerDate: { color: PLATINUM, fontSize: 9, marginTop: 4 },
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
  licensedText: { color: PLATINUM_BRIGHT, fontSize: 7, fontWeight: 'bold', letterSpacing: 0.5 },
  body: { padding: 12 },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: NAVY,
    marginBottom: 4,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Bill To + Invoice meta
  topGrid: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  billToCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    borderRadius: 4,
    padding: 8,
  },
  metaCard: {
    width: 180,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    borderRadius: 4,
    padding: 8,
    backgroundColor: GRAY_BG,
  },
  infoRow: { flexDirection: 'row', marginBottom: 3 },
  infoLabel: { fontSize: 8, color: GRAY_TEXT, width: 70 },
  infoValue: { fontSize: 9, color: NAVY, fontWeight: 'medium', flex: 1 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  metaLabel: { fontSize: 8, color: GRAY_TEXT },
  metaValue: { fontSize: 9, color: NAVY, fontWeight: 'bold' },
  // Amount due box
  amountBox: {
    backgroundColor: NAVY,
    borderRadius: 5,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  amountLabel: { color: PLATINUM, fontSize: 8, letterSpacing: 1.5, marginBottom: 3 },
  amountValue: { color: PLATINUM_BRIGHT, fontSize: 28, fontWeight: 'bold' },
  amountSub: { color: PLATINUM, fontSize: 8, marginTop: 3 },
  // Service table
  table: { borderWidth: 1, borderColor: GRAY_BORDER, borderRadius: 4, marginBottom: 10 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: NAVY,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tableHeaderText: { fontSize: 8, fontWeight: 'bold', color: PLATINUM_BRIGHT, textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 10 },
  colDesc: { flex: 3, fontSize: 9, color: NAVY },
  colAmount: { flex: 1, fontSize: 9, color: NAVY, fontWeight: 'medium', textAlign: 'right' },
  totalRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 10, backgroundColor: GRAY_BG },
  // Deposit notice
  depositBox: {
    backgroundColor: AMBER_BG,
    borderWidth: 1.5,
    borderColor: AMBER_BORDER,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  depositTitle: { fontSize: 9, fontWeight: 'bold', color: AMBER_TEXT, marginBottom: 3 },
  depositText: { fontSize: 8, color: AMBER_TEXT, lineHeight: 1.4 },
  // Payment instructions
  paymentBox: {
    borderWidth: 1.5,
    borderColor: NAVY,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  paymentTitle: { fontSize: 9, fontWeight: 'bold', color: NAVY, marginBottom: 5 },
  paymentItem: { flexDirection: 'row', marginBottom: 4 },
  paymentLabel: { fontSize: 8, fontWeight: 'bold', color: NAVY, width: 110 },
  paymentText: { fontSize: 8, color: NAVY, flex: 1, lineHeight: 1.3 },
  // Notes
  notesBox: { marginBottom: 10 },
  // Terms
  termsBox: {
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#FAFBFC',
  },
  termsTitle: { fontSize: 8, fontWeight: 'bold', color: NAVY, marginBottom: 3 },
  termsText: { fontSize: 7, color: GRAY_TEXT, lineHeight: 1.2 },
  // Signature
  signatureBox: {
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    borderRadius: 4,
    padding: 8,
    marginTop: 4,
  },
  signatureRow: { flexDirection: 'row', marginBottom: 6 },
  signatureField: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: NAVY,
    paddingBottom: 1,
    marginRight: 10,
    height: 18,
  },
  signatureFieldLast: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: NAVY,
    paddingBottom: 1,
    height: 18,
  },
  signatureLabel: { fontSize: 6, color: GRAY_TEXT, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatLevel(level: string) {
  if (level === 'both') return 'Rough + Final Clean'
  return `${level.charAt(0).toUpperCase() + level.slice(1)} Clean`
}

export function InvoicePDF({ data }: { data: InvoicePDFData }) {
  const remainingBalance = data.totalAmount - data.amountDue
  const statusLabel = data.status === 'paid' ? 'PAID' : data.status === 'sent' ? 'SENT' : data.status === 'overdue' ? 'OVERDUE' : 'DRAFT'

  return (
    <Document
      title={`Invoice ${data.invoiceNumber} - Platinum Construction Cleaning`}
      author="Platinum Construction Cleaning"
      subject="Invoice"
    >
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {logoBase64 ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image style={styles.logoImage} src={logoBase64} />
          ) : (
            <View style={{ marginRight: 12 }}>
              <Text style={{ color: PLATINUM_BRIGHT, fontSize: 16, fontWeight: 'bold' }}>PLATINUM</Text>
              <Text style={{ color: PLATINUM, fontSize: 8 }}>CONSTRUCTION CLEANING</Text>
            </View>
          )}
          <View style={styles.headerRight}>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{data.invoiceNumber}</Text>
            <View style={styles.licensedBadge}>
              <Text style={styles.licensedText}>★ STATE OF FLORIDA LICENSED &amp; INSURED</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {/* Bill To + Meta */}
          <View style={styles.topGrid}>
            <View style={styles.billToCard}>
              <Text style={styles.sectionTitle}>Bill To</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{data.customerName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{data.customerPhone}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{data.customerEmail}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{data.projectAddress}</Text>
              </View>
            </View>
            <View style={styles.metaCard}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Status</Text>
                <Text style={[styles.metaValue, { color: data.status === 'paid' ? EMERALD : NAVY }]}>{statusLabel}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Issue Date</Text>
                <Text style={styles.metaValue}>{formatDate(data.issueDate)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Due Date</Text>
                <Text style={styles.metaValue}>{formatDate(data.dueDate)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Type</Text>
                <Text style={styles.metaValue}>{data.isDeposit ? 'Deposit (50%)' : 'Full Payment'}</Text>
              </View>
            </View>
          </View>

          {/* Amount Due */}
          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>{data.isDeposit ? 'DEPOSIT DUE (50%)' : 'AMOUNT DUE'}</Text>
            <Text style={styles.amountValue}>{formatCurrency(data.amountDue)}</Text>
            <Text style={styles.amountSub}>
              {data.isDeposit
                ? `Remaining balance of ${formatCurrency(remainingBalance)} due upon completion`
                : `Total: ${formatCurrency(data.totalAmount)}`}
            </Text>
          </View>

          {/* Service table */}
          <Text style={styles.sectionTitle}>Service Description</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colDesc]}>Description</Text>
              <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.colDesc}>
                {data.propertyType === 'residential' ? 'Residential' : 'Commercial'}{' '}
                {formatLevel(data.cleaningLevel)} - {data.sqft.toLocaleString()} SQFT
                {data.hasDebris ? ' + Debris Removal' : ''}
                {data.hasStickers ? ' + Window Stickers' : ''}
              </Text>
              <Text style={styles.colAmount}>{formatCurrency(data.totalAmount)}</Text>
            </View>
            {data.isDeposit && (
              <>
                <View style={styles.tableRow}>
                  <Text style={[styles.colDesc, { color: GRAY_TEXT }]}>Total Service</Text>
                  <Text style={styles.colAmount}>{formatCurrency(data.totalAmount)}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={[styles.colDesc, { color: GRAY_TEXT }]}>Deposit Due Now (50%)</Text>
                  <Text style={styles.colAmount}>{formatCurrency(data.amountDue)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={[styles.colDesc, { fontWeight: 'bold' }]}>Balance Due Upon Completion</Text>
                  <Text style={[styles.colAmount, { fontWeight: 'bold', fontSize: 11 }]}>{formatCurrency(remainingBalance)}</Text>
                </View>
              </>
            )}
            {!data.isDeposit && (
              <View style={styles.totalRow}>
                <Text style={[styles.colDesc, { fontWeight: 'bold' }]}>Total Amount Due</Text>
                <Text style={[styles.colAmount, { fontWeight: 'bold', fontSize: 11 }]}>{formatCurrency(data.amountDue)}</Text>
              </View>
            )}
          </View>

          {/* Deposit notice (if applicable) */}
          {data.isDeposit && (
            <View style={styles.depositBox}>
              <Text style={styles.depositTitle}>DEPOSIT NOTICE</Text>
              <Text style={styles.depositText}>
                This invoice is for the 50% deposit required to schedule your project. The remaining balance of {formatCurrency(remainingBalance)} will be due immediately upon completion of the work. The project will not be scheduled until this deposit is received.
              </Text>
            </View>
          )}

          {/* Payment instructions */}
          <View style={styles.paymentBox}>
            <Text style={styles.paymentTitle}>Payment Instructions</Text>
            <View style={styles.paymentItem}>
              <Text style={styles.paymentLabel}>Make Checks Payable:</Text>
              <Text style={styles.paymentText}>Heroo Solutions LLC</Text>
            </View>
            <View style={styles.paymentItem}>
              <Text style={styles.paymentLabel}>Mail Check To:</Text>
              <Text style={styles.paymentText}>Heroo Solutions LLC, [Your Mailing Address], Miami, FL</Text>
            </View>
            <View style={styles.paymentItem}>
              <Text style={styles.paymentLabel}>Zelle (Quick Pay):</Text>
              <Text style={styles.paymentText}>Send to (786) 512-7353 or platinumconst.cleaning@gmail.com</Text>
            </View>
            <View style={styles.paymentItem}>
              <Text style={styles.paymentLabel}>Reference:</Text>
              <Text style={styles.paymentText}>Please include invoice number {data.invoiceNumber} on all payments.</Text>
            </View>
          </View>

          {/* Notes */}
          {data.notes && (
            <View style={styles.notesBox}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={{ fontSize: 8, color: NAVY, lineHeight: 1.3 }}>{data.notes}</Text>
            </View>
          )}

          {/* Terms */}
          <View style={styles.termsBox}>
            <Text style={styles.termsTitle}>Payment Terms</Text>
            <Text style={styles.termsText}>
              • Payment is due within 15 days of issue date.{'\n'}
              • A 50% deposit is required to schedule the project; balance due upon completion.{'\n'}
              • Late payments may incur a 1.5% monthly finance charge.{'\n'}
              • Cancellations within 24 hours of scheduled service may incur a cancellation fee.{'\n'}
              • This invoice is issued by Heroo Solutions LLC, State of Florida Licensed &amp; Insured.
            </Text>
          </View>

          {/* Signature */}
          <View style={styles.signatureBox}>
            <View style={styles.signatureRow}>
              <View style={styles.signatureField}>
                <Text style={styles.signatureLabel}>Authorized Signature</Text>
              </View>
              <View style={styles.signatureFieldLast}>
                <Text style={styles.signatureLabel}>Date</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}

export type { InvoicePDFData }
