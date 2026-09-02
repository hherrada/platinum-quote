// Libreria de envio de emails con Resend API
// Variables de entorno necesarias:
//   RESEND_API_KEY=re_xxx  (tu API key de Resend)
//   FROM_EMAIL=platinum@heroosolutions.com  (dominio verificado en Resend)
//   REPLY_TO_EMAIL=platinumconst.cleaning@gmail.com  (donde llegan las respuestas)
import { Resend } from 'resend'

interface EmailAttachment {
  filename: string
  content: Buffer
  contentType: string
}

interface SendQuoteEmailParams {
  to: string
  customerName: string
  quoteId: string
  minPrice: number
  maxPrice: number
  finalPrice?: number | null
  propertyType: string
  cleaningLevel: string
  sqft: number
  attachment: EmailAttachment
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatLevel(level: string) {
  if (level === 'both') return 'Rough + Final Clean'
  return `${level.charAt(0).toUpperCase() + level.slice(1)} Clean`
}

function formatProperty(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

// Plantilla HTML profesional para el email
function buildEmailHTML(params: SendQuoteEmailParams): string {
  const {
    customerName,
    quoteId,
    minPrice,
    maxPrice,
    finalPrice,
    propertyType,
    cleaningLevel,
    sqft,
  } = params

  const priceDisplay = finalPrice
    ? `<div style="font-size:32px;font-weight:bold;color:#1A2332;">${formatCurrency(finalPrice)}</div>
       <div style="font-size:13px;color:#6B7280;margin-top:4px;">Final Price (Approved)</div>`
    : `<div style="font-size:32px;font-weight:bold;color:#1A2332;">${formatCurrency(minPrice)} – ${formatCurrency(maxPrice)}</div>
       <div style="font-size:13px;color:#6B7280;margin-top:4px;">Estimated Range · Subject to Inspection</div>`

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#F4F6F8;font-family:Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F8;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header navy -->
          <tr>
            <td style="background-color:#1A2332;padding:28px 32px;border-bottom:3px solid #C0C5CD;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size:24px;font-weight:bold;color:#E8ECF0;letter-spacing:2px;">PLATINUM</div>
                    <div style="font-size:11px;color:#C0C5CD;letter-spacing:3px;margin-top:2px;">CONSTRUCTION CLEANING</div>
                  </td>
                  <td align="right">
                    <div style="font-size:9px;color:#9CA3AF;letter-spacing:1px;text-transform:uppercase;">Quote</div>
                    <div style="font-size:15px;font-weight:bold;color:#E8ECF0;margin-top:2px;">#${quoteId.slice(-8).toUpperCase()}</div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top:10px;">
                    <div style="display:inline-block;background-color:rgba(255,255,255,0.1);border:1px solid #C0C5CD;border-radius:3px;padding:4px 10px;font-size:9px;font-weight:bold;color:#E8ECF0;letter-spacing:0.5px;">
                      ★ STATE OF FLORIDA LICENSED &amp; INSURED
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 8px;font-size:20px;color:#1A2332;">Your Cleaning Quote</h1>
              <p style="margin:0 0 24px;font-size:14px;color:#6B7280;line-height:1.5;">
                Hello ${customerName},<br>
                Thank you for considering Platinum Construction Cleaning. Please find your quote details below. The full PDF document is attached to this email for your records.
              </p>

              <!-- Contact block -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border:1.5px solid #1A2332;border-radius:6px;overflow:hidden;">
                <tr>
                  <td style="background-color:#1A2332;padding:14px 18px;width:140px;vertical-align:middle;">
                    <div style="font-size:8px;color:#C0C5CD;letter-spacing:1.5px;text-transform:uppercase;">Your Point Of</div>
                    <div style="font-size:13px;color:#E8ECF0;font-weight:bold;letter-spacing:0.5px;">CONTACT</div>
                  </td>
                  <td style="background-color:#F4F6F8;padding:14px 18px;">
                    <div style="font-size:14px;font-weight:bold;color:#1A2332;">Maria Roldan</div>
                    <div style="font-size:12px;color:#6B7280;margin-top:2px;">Project Manager</div>
                    <div style="font-size:13px;color:#1A2332;font-weight:bold;margin-top:4px;">Direct: (786) 512-7353</div>
                  </td>
                </tr>
              </table>

              <!-- Project summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="border:1px solid #C0C5CD;border-radius:6px;padding:14px;width:50%;">
                    <div style="font-size:9px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #C0C5CD;">Project</div>
                    <div style="font-size:12px;color:#6B7280;">Type: <strong style="color:#1A2332;">${formatProperty(propertyType)}</strong></div>
                    <div style="font-size:12px;color:#6B7280;margin-top:4px;">Service: <strong style="color:#1A2332;">${formatLevel(cleaningLevel)}</strong></div>
                    <div style="font-size:12px;color:#6B7280;margin-top:4px;">Area: <strong style="color:#1A2332;">${sqft.toLocaleString()} SQFT</strong></div>
                  </td>
                  <td style="width:12px;"></td>
                  <td style="background-color:#F4F6F8;border:2px solid #1A2332;border-radius:6px;padding:14px;width:50%;text-align:center;vertical-align:middle;">
                    ${priceDisplay}
                  </td>
                </tr>
              </table>

              <!-- Next steps box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#1A2332;border-radius:6px;padding:16px 18px;">
                    <div style="font-size:11px;font-weight:bold;color:#E8ECF0;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Next Steps</div>
                    <div style="font-size:12px;color:#C0C5CD;line-height:1.5;">
                      ${finalPrice
                        ? 'Your final quote is ready. Please review the attached PDF and contact us to schedule the service.'
                        : 'To approve this estimated range and schedule your free on-site inspection, please contact Maria Roldan. A final binding quote will be provided after the walk-through.'}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="tel:+17865127353" style="display:inline-block;background-color:#1A2332;color:#E8ECF0;text-decoration:none;font-size:13px;font-weight:bold;padding:12px 32px;border-radius:6px;letter-spacing:0.5px;">
                      Call Maria: (786) 512-7353
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer navy -->
          <tr>
            <td style="background-color:#1A2332;padding:16px 32px;border-top:1px solid #C0C5CD;">
              <div style="font-size:11px;color:#C0C5CD;text-align:center;line-height:1.6;">
                Platinum Construction Cleaning · Miami, FL<br>
                (305) 555-0192 · Licensed &amp; Insured
              </div>
              <div style="font-size:9px;color:#9CA3AF;text-align:center;margin-top:8px;">
                This estimate is subject to visual inspection on site. No price is final until an on-site inspection is completed.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

let resendClient: Resend | null = null

function getResend(): Resend {
  if (resendClient) return resendClient
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is required')
  }
  resendClient = new Resend(apiKey)
  return resendClient
}

export async function sendQuoteEmail(params: SendQuoteEmailParams): Promise<void> {
  const resend = getResend()
  const html = buildEmailHTML(params)
  const fromEmail = process.env.FROM_EMAIL || 'platinum@heroosolutions.com'
  const replyTo = process.env.REPLY_TO_EMAIL || 'platinumconst.cleaning@gmail.com'

  const { error } = await resend.emails.send({
    from: `Platinum Construction Cleaning <${fromEmail}>`,
    to: params.to,
    replyTo,
    subject: params.finalPrice
      ? `Final Quote #${params.quoteId.slice(-8).toUpperCase()} - Platinum Construction Cleaning`
      : `Your Cleaning Estimate #${params.quoteId.slice(-8).toUpperCase()} - Platinum Construction Cleaning`,
    html,
    attachments: [
      {
        filename: params.attachment.filename,
        content: params.attachment.content,
      },
    ],
  })

  if (error) {
    throw new Error(`Resend API error: ${error.message}`)
  }
}

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}

// ===== INVOICE EMAIL =====

interface SendInvoiceEmailParams {
  to: string
  customerName: string
  invoiceNumber: string
  totalAmount: number
  amountDue: number
  isDeposit: boolean
  dueDate: string
  status: string
  propertyType: string
  cleaningLevel: string
  sqft: number
  attachment: EmailAttachment
}

function buildInvoiceEmailHTML(params: SendInvoiceEmailParams): string {
  const {
    customerName,
    invoiceNumber,
    totalAmount,
    amountDue,
    isDeposit,
    dueDate,
    status,
    propertyType,
    cleaningLevel,
    sqft,
  } = params

  const isPaid = status === 'paid'
  const remainingBalance = totalAmount - amountDue

  const amountLabel = isDeposit ? 'DEPOSIT DUE (50%)' : isPaid ? 'PAID' : 'AMOUNT DUE'
  const amountColor = isPaid ? '#059669' : '#1A2332'

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#F4F6F8;font-family:Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F8;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header navy -->
          <tr>
            <td style="background-color:#1A2332;padding:28px 32px;border-bottom:3px solid #C0C5CD;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size:24px;font-weight:bold;color:#E8ECF0;letter-spacing:2px;">PLATINUM</div>
                    <div style="font-size:11px;color:#C0C5CD;letter-spacing:3px;margin-top:2px;">CONSTRUCTION CLEANING</div>
                  </td>
                  <td align="right">
                    <div style="font-size:9px;color:#9CA3AF;letter-spacing:1px;text-transform:uppercase;">Invoice</div>
                    <div style="font-size:15px;font-weight:bold;color:#E8ECF0;margin-top:2px;">${invoiceNumber}</div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top:10px;">
                    <div style="display:inline-block;background-color:rgba(255,255,255,0.1);border:1px solid #C0C5CD;border-radius:3px;padding:4px 10px;font-size:9px;font-weight:bold;color:#E8ECF0;letter-spacing:0.5px;">
                      ★ STATE OF FLORIDA LICENSED &amp; INSURED
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 8px;font-size:20px;color:#1A2332;">Your Invoice</h1>
              <p style="margin:0 0 24px;font-size:14px;color:#6B7280;line-height:1.5;">
                Hello ${customerName},<br>
                ${isPaid
                  ? 'Your invoice has been marked as paid. Thank you for your payment! The full PDF invoice is attached for your records.'
                  : `Please find your invoice below. ${isDeposit ? 'This is for the 50% deposit required to schedule your project.' : 'Payment is due by ' + new Date(dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + '.'} The full PDF document is attached to this email.`}
              </p>

              <!-- Amount box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background-color:${amountColor};border-radius:6px;">
                <tr>
                  <td style="padding:20px;text-align:center;">
                    <div style="font-size:11px;color:rgba(255,255,255,0.7);letter-spacing:1.5px;margin-bottom:4px;">${amountLabel}</div>
                    <div style="font-size:32px;font-weight:bold;color:#FFFFFF;">${formatCurrency(amountDue)}</div>
                    ${isDeposit ? `<div style="font-size:12px;color:rgba(255,255,255,0.8);margin-top:4px;">Remaining balance of ${formatCurrency(remainingBalance)} due upon completion</div>` : ''}
                  </td>
                </tr>
              </table>

              <!-- Project summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="border:1px solid #C0C5CD;border-radius:6px;padding:14px;width:50%;">
                    <div style="font-size:9px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #C0C5CD;">Project</div>
                    <div style="font-size:12px;color:#6B7280;">Type: <strong style="color:#1A2332;">${formatProperty(propertyType)}</strong></div>
                    <div style="font-size:12px;color:#6B7280;margin-top:4px;">Service: <strong style="color:#1A2332;">${formatLevel(cleaningLevel)}</strong></div>
                    <div style="font-size:12px;color:#6B7280;margin-top:4px;">Area: <strong style="color:#1A2332;">${sqft.toLocaleString()} SQFT</strong></div>
                  </td>
                  <td style="width:12px;"></td>
                  <td style="background-color:#F4F6F8;border:1px solid #C0C5CD;border-radius:6px;padding:14px;width:50%;">
                    <div style="font-size:9px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #C0C5CD;">Invoice Details</div>
                    <div style="font-size:12px;color:#6B7280;">Total: <strong style="color:#1A2332;">${formatCurrency(totalAmount)}</strong></div>
                    <div style="font-size:12px;color:#6B7280;margin-top:4px;">Type: <strong style="color:#1A2332;">${isDeposit ? 'Deposit (50%)' : 'Full Payment'}</strong></div>
                    <div style="font-size:12px;color:#6B7280;margin-top:4px;">Due: <strong style="color:#1A2332;">${new Date(dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></div>
                  </td>
                </tr>
              </table>

              ${!isPaid ? `
              <!-- Payment instructions -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#1A2332;border-radius:6px;padding:16px 18px;">
                    <div style="font-size:11px;font-weight:bold;color:#E8ECF0;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Payment Instructions</div>
                    <div style="font-size:11px;color:#C0C5CD;line-height:1.7;">
                      <strong style="color:#E8ECF0;">Make checks payable to:</strong> Heroo Solutions LLC<br>
                      <strong style="color:#E8ECF0;">Zelle (Quick Pay):</strong> (786) 512-7353<br>
                      <strong style="color:#E8ECF0;">Reference:</strong> Invoice ${invoiceNumber}
                    </div>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- CTA -->
              ${!isPaid ? `
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="tel:+17865127353" style="display:inline-block;background-color:#1A2332;color:#E8ECF0;text-decoration:none;font-size:13px;font-weight:bold;padding:12px 32px;border-radius:6px;letter-spacing:0.5px;">
                      Questions? Call Maria: (786) 512-7353
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>

          <!-- Footer navy -->
          <tr>
            <td style="background-color:#1A2332;padding:16px 32px;border-top:1px solid #C0C5CD;">
              <div style="font-size:11px;color:#C0C5CD;text-align:center;line-height:1.6;">
                Platinum Construction Cleaning · Heroo Solutions LLC<br>
                (305) 555-0192 · Licensed &amp; Insured
              </div>
              <div style="font-size:9px;color:#9CA3AF;text-align:center;margin-top:8px;">
                Issued by Heroo Solutions LLC, State of Florida Licensed &amp; Insured.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendInvoiceEmail(params: SendInvoiceEmailParams): Promise<void> {
  const resend = getResend()
  const html = buildInvoiceEmailHTML(params)
  const fromEmail = process.env.FROM_EMAIL || 'platinum@heroosolutions.com'
  const replyTo = process.env.REPLY_TO_EMAIL || 'platinumconst.cleaning@gmail.com'

  const { error } = await resend.emails.send({
    from: `Platinum Construction Cleaning <${fromEmail}>`,
    to: params.to,
    replyTo,
    subject: `Invoice ${params.invoiceNumber} - Platinum Construction Cleaning`,
    html,
    attachments: [
      {
        filename: params.attachment.filename,
        content: params.attachment.content,
      },
    ],
  })

  if (error) {
    throw new Error(`Resend API error: ${error.message}`)
  }
}
