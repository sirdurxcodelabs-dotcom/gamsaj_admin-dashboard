import { useState } from 'react'
import { Alert, Badge, Button, Form, Modal, Table } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { billingAPI } from '@/services/api'

interface Props {
  show: boolean
  doc: any
  onHide: () => void
  onSaved: (msg: string, autoConverted: boolean) => void
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'secondary', sent: 'info', partial: 'warning', paid: 'success', cancelled: 'danger',
}

const PaymentModal = ({ show, doc, onHide, onSaved }: Props) => {
  const [amount, setAmount] = useState<number | ''>('')
  const [method, setMethod] = useState('transfer')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const remaining = (doc.balance ?? doc.total) as number
  const amountPaid = doc.amountPaid ?? 0

  const setQuick = (val: number) => setAmount(parseFloat(val.toFixed(2)))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) { setError('Enter a valid amount'); return }
    setSaving(true)
    setError(null)
    try {
      const res = await billingAPI.addPayment(doc._id, {
        amount: Number(amount), method, note, date,
      })
      onSaved(res.data.message, res.data.autoConverted)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <IconifyIcon icon="ri:money-dollar-circle-line" className="me-2 text-success" />
          Record Payment — {doc.documentNumber}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Summary */}
        <div className="d-flex gap-4 mb-4 p-3 rounded bg-light-subtle border">
          <div className="text-center">
            <div className="text-muted" style={{ fontSize: 12 }}>Total</div>
            <div className="fw-bold fs-5">₦{doc.total?.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-muted" style={{ fontSize: 12 }}>Paid</div>
            <div className="fw-bold fs-5 text-success">₦{amountPaid.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-muted" style={{ fontSize: 12 }}>Balance</div>
            <div className="fw-bold fs-5 text-danger">₦{remaining.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-muted" style={{ fontSize: 12 }}>Status</div>
            <Badge bg={STATUS_BADGE[doc.status]} className="text-capitalize mt-1">{doc.status}</Badge>
          </div>
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

        {/* Quick buttons */}
        <div className="mb-3">
          <div className="text-muted mb-2" style={{ fontSize: 12 }}>Quick Amount</div>
          <div className="d-flex gap-2 flex-wrap">
            <Button size="sm" variant="outline-success" onClick={() => setQuick(remaining)}>
              Pay Full (₦{remaining.toLocaleString()})
            </Button>
            <Button size="sm" variant="outline-primary" onClick={() => setQuick(doc.total / 2)}>
              Pay Half (₦{(doc.total / 2).toLocaleString()})
            </Button>
            <Button size="sm" variant="outline-secondary" onClick={() => setQuick(doc.total / 4)}>
              Pay Quarter (₦{(doc.total / 4).toLocaleString()})
            </Button>
          </div>
        </div>

        <Form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-4">
              <Form.Label>Amount (₦) *</Form.Label>
              <Form.Control
                type="number" min={0.01} step="0.01" required
                value={amount}
                onChange={e => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="0.00"
              />
            </div>
            <div className="col-md-4">
              <Form.Label>Method</Form.Label>
              <Form.Select value={method} onChange={e => setMethod(e.target.value)}>
                <option value="transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
              </Form.Select>
            </div>
            <div className="col-md-4">
              <Form.Label>Date</Form.Label>
              <Form.Control type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="col-12">
              <Form.Label>Note</Form.Label>
              <Form.Control
                placeholder="e.g. First instalment"
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>
          </div>

          {/* Payment history */}
          {doc.payments?.length > 0 && (
            <div className="mt-4">
              <div className="text-muted mb-2" style={{ fontSize: 12 }}>Payment History</div>
              <Table size="sm" bordered className="mb-0">
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
              </Table>
            </div>
          )}

          <div className="d-flex gap-2 justify-content-end mt-4">
            <Button variant="secondary" onClick={onHide}>Cancel</Button>
            <Button type="submit" variant="success" disabled={saving}>
              {saving
                ? 'Recording...'
                : <><IconifyIcon icon="ri:check-line" className="me-1" />Record Payment</>}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  )
}

export default PaymentModal
