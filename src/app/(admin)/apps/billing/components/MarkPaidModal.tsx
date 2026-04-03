import { useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { billingAPI } from '@/services/api'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

interface Props {
  show: boolean
  doc: any
  onHide: () => void
  onSaved: () => void
}

const MarkPaidModal = ({ show, doc, onHide, onSaved }: Props) => {
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await billingAPI.markPaid(doc._id, paymentDate)
      onSaved()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to mark as paid')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <IconifyIcon icon="ri:money-dollar-circle-line" className="me-2 text-success" />
          Record Payment
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <p className="text-muted mb-3">
            Recording payment for <strong>{doc.documentNumber}</strong> — <strong>₦{doc.total?.toLocaleString()}</strong>
          </p>
          <p className="text-muted mb-3" style={{ fontSize: 13 }}>
            This will convert the invoice to a <span className="badge bg-success">Receipt</span> and mark it as paid.
          </p>
          <Form.Group>
            <Form.Label>Payment Date</Form.Label>
            <Form.Control
              type="date"
              value={paymentDate}
              onChange={e => setPaymentDate(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancel</Button>
          <Button type="submit" variant="success" disabled={saving}>
            {saving ? 'Processing...' : 'Confirm Payment → Generate Receipt'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default MarkPaidModal
