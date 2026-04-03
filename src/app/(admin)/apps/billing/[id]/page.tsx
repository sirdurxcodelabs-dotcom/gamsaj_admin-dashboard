import { useEffect, useState } from 'react'
import { Badge, Button, Card, CardBody, Col, Row, Spinner } from 'react-bootstrap'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { billingAPI } from '@/services/api'
import BillingFormModal from '../components/BillingFormModal'
import MarkPaidModal from '../components/MarkPaidModal'
import ShareModal from '../components/ShareModal'
import PaymentModal from '../components/PaymentModal'
import { BillingToastProvider, showToast } from '../components/BillingToast'

const TYPE_BADGE: Record<string, string> = { estimate: 'warning', invoice: 'primary', receipt: 'success' }
const STATUS_BADGE: Record<string, string> = { draft: 'secondary', sent: 'info', partial: 'warning', paid: 'success', cancelled: 'danger' }

const BillingDocument = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [doc, setDoc] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [showMarkPaid, setShowMarkPaid] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showPayment, setShowPayment] = useState(false)

  const fetchDoc = async () => {
    try {
      const res = await billingAPI.getOne(id!)
      setDoc(res.data.data)
    } catch {
      navigate('/error-404')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDoc() }, [id])

  // Auto-print if ?print=1
  useEffect(() => {
    if (!loading && doc && searchParams.get('print') === '1') {
      setTimeout(() => window.print(), 500)
    }
  }, [loading, doc])

  const handleConvert = async () => {
    const next = doc.type === 'estimate' ? 'invoice' : 'receipt'
    if (!confirm(`Convert to ${next}?`)) return
    await billingAPI.convert(id!)
    fetchDoc()
  }

  const handleDelete = async () => {
    if (!confirm('Delete this document?')) return
    await billingAPI.remove(id!)
    navigate('/apps/billing')
  }

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
  if (!doc) return null

  const subtotal = doc.subtotal ?? 0
  const discountAmt = doc.discountType === 'percent'
    ? (subtotal * (doc.discountValue || 0)) / 100
    : (doc.discountValue || 0)
  const afterDisc = subtotal - discountAmt
  const taxAmt = (afterDisc * (doc.taxRate || 0)) / 100
  const typeLabel = doc.type.charAt(0).toUpperCase() + doc.type.slice(1)

  return (
    <>
      <PageTitle title={`${typeLabel} — ${doc.documentNumber}`} />

      {/* Action bar — hidden on print */}
      <div className="d-print-none mb-3 d-flex gap-2 flex-wrap">
        <Button variant="secondary" size="sm" onClick={() => navigate('/apps/billing')}>
          <IconifyIcon icon="ri:arrow-left-line" className="me-1" />Back
        </Button>
        <Button variant="primary" size="sm" onClick={() => setShowEdit(true)}>
          <IconifyIcon icon="ri:edit-line" className="me-1" />Edit
        </Button>
        {doc.type !== 'receipt' && (
          <Button variant="success" size="sm" onClick={handleConvert}>
            <IconifyIcon icon="ri:arrow-right-circle-line" className="me-1" />
            Convert to {doc.type === 'estimate' ? 'Invoice' : 'Receipt'}
          </Button>
        )}
        {doc.type === 'invoice' && doc.status !== 'paid' && (
          <Button variant="warning" size="sm" onClick={() => setShowMarkPaid(true)}>
            <IconifyIcon icon="ri:money-dollar-circle-line" className="me-1" />Mark Paid
          </Button>
        )}
        {(doc.type === 'invoice' || doc.type === 'receipt') && doc.status !== 'paid' && (
          <Button variant="success" size="sm" onClick={() => setShowPayment(true)}>
            <IconifyIcon icon="ri:bank-card-line" className="me-1" />Add Payment
          </Button>
        )}
        <Button variant="info" size="sm" onClick={() => window.print()}>
          <IconifyIcon icon="ri:printer-line" className="me-1" />Print
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setShowShare(true)}>
          <IconifyIcon icon="ri:share-line" className="me-1" />Share
        </Button>
        <Button variant="danger" size="sm" onClick={handleDelete}>
          <IconifyIcon icon="ri:delete-bin-line" className="me-1" />Delete
        </Button>
      </div>

      {/* Printable document */}
      <Row>
        <Col xs={12}>
          <Card id="billing-print-area">
            <CardBody className="position-relative" style={{ minHeight: 600 }}>

              {/* Watermark */}
              <div className="billing-watermark" aria-hidden="true">
                <img src="/GamSaj Logo.png" alt="" />
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <Row className="mb-4">
                  <Col xs={6}>
                    <img src="/GamSaj Logo.png" alt="GAMSAJ" style={{ maxHeight: 70, width: 'auto' }} />
                    <p className="text-muted mt-2 mb-0" style={{ fontSize: 12 }}>GAMSAJ International Limited</p>
                    <p className="text-muted mb-0" style={{ fontSize: 12 }}>RC: 965221</p>
                  </Col>
                  <Col xs={6} className="text-end">
                    <h3 className="text-uppercase fw-bold">
                      <Badge bg={TYPE_BADGE[doc.type]} className="fs-5 px-3 py-2">{typeLabel}</Badge>
                    </h3>
                    <p className="mb-1"><strong>Doc #:</strong> {doc.documentNumber}</p>
                    <p className="mb-1"><strong>Issue Date:</strong> {new Date(doc.issueDate).toLocaleDateString()}</p>
                    {doc.dueDate && <p className="mb-1"><strong>Due Date:</strong> {new Date(doc.dueDate).toLocaleDateString()}</p>}
                    {doc.paymentDate && <p className="mb-1"><strong>Payment Date:</strong> {new Date(doc.paymentDate).toLocaleDateString()}</p>}
                    <Badge bg={STATUS_BADGE[doc.status]} className="text-capitalize mt-1">{doc.status}</Badge>
                  </Col>
                </Row>

                {/* Bill To */}
                <Row className="mb-4">
                  <Col xs={6}>
                    <h6 className="text-muted text-uppercase" style={{ fontSize: 11, letterSpacing: 1 }}>Bill To</h6>
                    <p className="mb-0 fw-semibold">{doc.clientName}</p>
                    {doc.clientEmail && <p className="mb-0 text-muted" style={{ fontSize: 13 }}>{doc.clientEmail}</p>}
                    {doc.clientPhone && <p className="mb-0 text-muted" style={{ fontSize: 13 }}>{doc.clientPhone}</p>}
                    {doc.clientAddress && <p className="mb-0 text-muted" style={{ fontSize: 13 }}>{doc.clientAddress}</p>}
                  </Col>
                </Row>

                {/* Items table */}
                <div className="table-responsive mb-4">
                  <table className="table table-bordered table-sm align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Description</th>
                        <th className="text-center">Qty</th>
                        <th className="text-end">Unit Price</th>
                        <th className="text-center">Disc %</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doc.items?.map((item: any, i: number) => {
                        const gross = item.quantity * item.unitPrice
                        const lineTotal = gross - (gross * (item.discount || 0)) / 100
                        return (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td>{item.description}</td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-end">₦{item.unitPrice?.toLocaleString()}</td>
                            <td className="text-center">{item.discount || 0}%</td>
                            <td className="text-end">₦{lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Totals + Notes */}
                <Row>
                  <Col md={6}>
                    {doc.notes && (
                      <div className="mb-3">
                        <h6 className="text-muted text-uppercase" style={{ fontSize: 11, letterSpacing: 1 }}>Notes</h6>
                        <p style={{ fontSize: 13 }}>{doc.notes}</p>
                      </div>
                    )}
                    {doc.terms && (
                      <div>
                        <h6 className="text-muted text-uppercase" style={{ fontSize: 11, letterSpacing: 1 }}>Terms & Conditions</h6>
                        <p style={{ fontSize: 13 }}>{doc.terms}</p>
                      </div>
                    )}
                  </Col>
                  <Col md={6}>
                    <table className="table table-sm ms-auto" style={{ maxWidth: 320 }}>
                      <tbody>
                        <tr>
                          <td>Subtotal</td>
                          <td className="text-end">₦{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                        {discountAmt > 0 && (
                          <tr>
                            <td>Discount {doc.discountType === 'percent' ? `(${doc.discountValue}%)` : '(Fixed)'}</td>
                            <td className="text-end text-danger">-₦{discountAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          </tr>
                        )}
                        {doc.taxRate > 0 && (
                          <tr>
                            <td>VAT ({doc.taxRate}%)</td>
                            <td className="text-end">₦{taxAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          </tr>
                        )}
                        <tr className="table-primary fw-bold">
                          <td>TOTAL</td>
                          <td className="text-end">₦{doc.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                      </tbody>
                    </table>
                  </Col>
                </Row>

                {/* Payment summary — invoice/receipt */}
                {(doc.type === 'invoice' || doc.type === 'receipt') && (
                  <Row className="mt-3">
                    <Col md={{ span: 4, offset: 8 }}>
                      <table className="table table-sm" style={{ maxWidth: 320, marginLeft: 'auto' }}>
                        <tbody>
                          <tr>
                            <td className="text-muted">Amount Paid</td>
                            <td className="text-end text-success fw-semibold">
                              ₦{(doc.amountPaid ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                          <tr>
                            <td className="text-muted">Balance Due</td>
                            <td className="text-end text-danger fw-semibold">
                              ₦{(doc.balance ?? doc.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </Col>
                  </Row>
                )}

                {/* Payment history on document */}
                {doc.payments?.length > 0 && (
                  <Row className="mt-2">
                    <Col xs={12}>
                      <h6 className="text-muted text-uppercase" style={{ fontSize: 11, letterSpacing: 1 }}>Payment History</h6>
                      <table className="table table-sm table-bordered">
                        <thead className="table-light">
                          <tr><th>Date</th><th>Amount</th><th>Method</th><th>Note</th></tr>
                        </thead>
                        <tbody>
                          {doc.payments.map((p: any, i: number) => (
                            <tr key={i}>
                              <td>{new Date(p.date).toLocaleDateString()}</td>
                              <td>₦{p.amount?.toLocaleString()}</td>
                              <td className="text-capitalize">{p.method}</td>
                              <td>{p.note || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Col>
                  </Row>
                )}

                {/* Signature */}
                {doc.showSignature && doc.signedBy?.signature && (
                  <Row className="mt-4 pt-3 border-top">
                    <Col xs={12} md={4}>
                      <p className="text-muted mb-1" style={{ fontSize: 12 }}>Authorised Signature</p>
                      <img
                        src={doc.signedBy.signature}
                        alt="Signature"
                        style={{ maxHeight: 60, maxWidth: 200, objectFit: 'contain' }}
                      />
                      <p className="mb-0 fw-semibold" style={{ fontSize: 13 }}>{doc.signedBy.name}</p>
                      {doc.signedBy.role?.name && (
                        <p className="text-muted mb-0" style={{ fontSize: 12 }}>{doc.signedBy.role.name}</p>
                      )}
                    </Col>
                  </Row>
                )}

                {/* Footer */}
                <div className="text-center mt-5 pt-3 border-top text-muted" style={{ fontSize: 11 }}>
                  GAMSAJ International Limited — RC: 965221 — Thank you for your business
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {showEdit && (
        <BillingFormModal show={showEdit} onHide={() => setShowEdit(false)} editDoc={doc} lockedType={doc.type} onSaved={fetchDoc} />
      )}
      {showMarkPaid && (
        <MarkPaidModal
          show={showMarkPaid}
          doc={doc}
          onHide={() => setShowMarkPaid(false)}
          onSaved={() => { setShowMarkPaid(false); fetchDoc() }}
        />
      )}
      {showShare && (
        <ShareModal show={showShare} doc={doc} onHide={() => setShowShare(false)} />
      )}
      {showPayment && (
        <PaymentModal
          show={showPayment}
          doc={doc}
          onHide={() => setShowPayment(false)}
          onSaved={(msg) => { setShowPayment(false); showToast(msg); fetchDoc() }}
        />
      )}
      <BillingToastProvider />

      <style>{`
        .billing-watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          opacity: 0.05;
          pointer-events: none;
          z-index: 0;
        }
        .billing-watermark img { width: 340px; }

        @media print {
          body > * { display: none !important; }
          #root { display: block !important; }
          #root > * { display: none !important; }
          #billing-print-area {
            display: block !important;
            position: fixed !important;
            top: 0; left: 0;
            width: 100%; height: auto;
            box-shadow: none !important;
            border: none !important;
          }
          .d-print-none { display: none !important; }
          .billing-watermark { opacity: 0.04 !important; }
        }
      `}</style>
    </>
  )
}

export default BillingDocument
