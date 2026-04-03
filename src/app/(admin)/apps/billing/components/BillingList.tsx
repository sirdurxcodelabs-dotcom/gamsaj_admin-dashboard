import { useEffect, useState } from 'react'
import { Badge, Button, Card, CardBody, Col, Row, Spinner, Table } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { billingAPI } from '@/services/api'
import BillingFormModal from './BillingFormModal'
import MarkPaidModal from './MarkPaidModal'
import ShareModal from './ShareModal'
import PaymentModal from './PaymentModal'
import { BillingToastProvider, showToast } from './BillingToast'

const TYPE_BADGE: Record<string, string> = {
  estimate: 'warning',
  invoice: 'primary',
  receipt: 'success',
}
const STATUS_BADGE: Record<string, string> = {
  draft: 'secondary',
  sent: 'info',
  partial: 'warning',
  paid: 'success',
  cancelled: 'danger',
}
const TYPE_LABELS: Record<string, string> = {
  estimate: 'Estimates',
  invoice: 'Invoices',
  receipt: 'Receipts',
  '': 'All Documents',
}
const CONVERT_LABEL: Record<string, string> = {
  estimate: 'Convert to Invoice',
  invoice: 'Convert to Receipt',
}

interface Props {
  type: 'estimate' | 'invoice' | 'receipt' | ''
}

const BillingList = ({ type }: Props) => {
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editDoc, setEditDoc] = useState<any>(null)
  const [markPaidDoc, setMarkPaidDoc] = useState<any>(null)
  const [shareDoc, setShareDoc] = useState<any>(null)
  const [paymentDoc, setPaymentDoc] = useState<any>(null)
  const navigate = useNavigate()

  const fetchDocs = async () => {
    setLoading(true)
    try {
      const res = await billingAPI.getAll({ type: type || undefined })
      setDocs(res.data.data || [])
    } catch {
      setDocs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDocs() }, [type])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return
    await billingAPI.remove(id)
    fetchDocs()
  }

  const handleConvert = async (id: string) => {
    await billingAPI.convert(id)
    fetchDocs()
  }

  const openCreate = () => { setEditDoc(null); setShowModal(true) }
  const openEdit = (doc: any) => { setEditDoc(doc); setShowModal(true) }

  const label = TYPE_LABELS[type]

  return (
    <>
      <Card>
        <CardBody>
          <Row className="mb-3 align-items-center">
            <Col>
              <h5 className="mb-0">{label}</h5>
            </Col>
            {type !== 'receipt' && (
              <Col xs="auto">
                <Button size="sm" variant="primary" onClick={openCreate}>
                  <IconifyIcon icon="ri:add-line" className="me-1" />
                  New {type === 'invoice' ? 'Invoice' : 'Estimate'}
                </Button>
              </Col>
            )}
          </Row>

          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="bg-light-subtle">
                  <tr>
                    <th>Doc #</th>
                    <th>Client</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-5">
                        <IconifyIcon icon="ri:file-list-3-line" style={{ fontSize: 40, opacity: 0.25 }} />
                        <p className="text-muted mt-2 mb-3">No {label.toLowerCase()} found</p>
                        {type !== 'receipt' && (
                          <Button size="sm" variant="primary" onClick={openCreate}>
                            <IconifyIcon icon="ri:add-line" className="me-1" />
                            Create {type === 'invoice' ? 'Invoice' : 'Estimate'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ) : docs.map(doc => (
                    <tr key={doc._id}>
                      <td>
                        <span className="text-primary fw-semibold" style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/apps/billing/${doc._id}`)}>
                          {doc.documentNumber}
                        </span>
                      </td>
                      <td>
                        <div className="fw-semibold">{doc.clientName}</div>
                        {doc.clientEmail && <small className="text-muted">{doc.clientEmail}</small>}
                      </td>
                      <td className="fw-semibold">₦{doc.total?.toLocaleString()}</td>
                      <td><Badge bg={STATUS_BADGE[doc.status]} className="text-capitalize">{doc.status}</Badge></td>
                      <td>{new Date(doc.issueDate).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex gap-1 justify-content-end flex-wrap">
                          {/* View */}
                          <Button size="sm" variant="soft-info" title="View"
                            onClick={() => navigate(`/apps/billing/${doc._id}`)}>
                            <IconifyIcon icon="ri:eye-line" />
                          </Button>

                          {/* Edit — not for receipt */}
                          {type !== 'receipt' && (
                            <Button size="sm" variant="soft-primary" title="Edit" onClick={() => openEdit(doc)}>
                              <IconifyIcon icon="ri:edit-line" />
                            </Button>
                          )}

                          {/* Convert */}
                          {(type === 'estimate' || type === 'invoice') && (
                            <Button size="sm" variant="soft-success"
                              title={CONVERT_LABEL[type]}
                              onClick={() => handleConvert(doc._id)}>
                              <IconifyIcon icon="ri:arrow-right-circle-line" />
                            </Button>
                          )}

                          {/* Mark Paid — invoice only */}
                          {type === 'invoice' && doc.status !== 'paid' && (
                            <Button size="sm" variant="soft-warning" title="Mark Paid"
                              onClick={() => setMarkPaidDoc(doc)}>
                              <IconifyIcon icon="ri:money-dollar-circle-line" />
                            </Button>
                          )}

                          {/* Add Payment — invoice/receipt with balance */}
                          {(type === 'invoice' || type === 'receipt') && doc.status !== 'paid' && (
                            <Button size="sm" variant="soft-success" title="Add Payment"
                              onClick={() => setPaymentDoc(doc)}>
                              <IconifyIcon icon="ri:bank-card-line" />
                            </Button>
                          )}

                          {/* Share */}
                          <Button size="sm" variant="soft-secondary" title="Share"
                            onClick={() => setShareDoc(doc)}>
                            <IconifyIcon icon="ri:share-line" />
                          </Button>

                          {/* Print */}
                          <Button size="sm" variant="soft-dark" title="Print"
                            onClick={() => navigate(`/apps/billing/${doc._id}?print=1`)}>
                            <IconifyIcon icon="ri:printer-line" />
                          </Button>

                          {/* Delete — not for receipt */}
                          {type !== 'receipt' && (
                            <Button size="sm" variant="soft-danger" title="Delete"
                              onClick={() => handleDelete(doc._id)}>
                              <IconifyIcon icon="ri:delete-bin-line" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>

      {showModal && (
        <BillingFormModal
          show={showModal}
          onHide={() => setShowModal(false)}
          editDoc={editDoc}
          lockedType={type || 'estimate'}
          onSaved={fetchDocs}
        />
      )}
      {markPaidDoc && (
        <MarkPaidModal
          show={!!markPaidDoc}
          doc={markPaidDoc}
          onHide={() => setMarkPaidDoc(null)}
          onSaved={() => { setMarkPaidDoc(null); fetchDocs() }}
        />
      )}
      {shareDoc && (
        <ShareModal
          show={!!shareDoc}
          doc={shareDoc}
          onHide={() => setShareDoc(null)}
        />
      )}
      {paymentDoc && (
        <PaymentModal
          show={!!paymentDoc}
          doc={paymentDoc}
          onHide={() => setPaymentDoc(null)}
          onSaved={(msg, autoConverted) => {
            setPaymentDoc(null)
            showToast(msg, autoConverted ? 'success' : 'success')
            fetchDocs()
          }}
        />
      )}
      <BillingToastProvider />
    </>
  )
}

export default BillingList
