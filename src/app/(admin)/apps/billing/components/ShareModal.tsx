import { useState } from 'react'
import { Alert, Button, Form, Modal, Nav, NavItem, NavLink } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { billingAPI } from '@/services/api'

interface Props {
  show: boolean
  doc: any
  onHide: () => void
}

const APP_URL = window.location.origin

const ShareModal = ({ show, doc, onHide }: Props) => {
  const [tab, setTab] = useState<'email' | 'whatsapp'>('email')
  const [emailTo, setEmailTo] = useState(doc.clientEmail || '')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'danger'; text: string } | null>(null)

  const typeLabel = doc.type.charAt(0).toUpperCase() + doc.type.slice(1)
  const docLink = `${APP_URL}/apps/billing/${doc._id}`

  const defaultMessage = `Hello ${doc.clientName},\n\nPlease find your ${typeLabel} below:\n${docLink}\n\nDocument #: ${doc.documentNumber}\nAmount: ₦${doc.total?.toLocaleString()}\n\nThank you.\nGAMSAJ International Limited`

  const [message, setMessage] = useState(defaultMessage)

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setResult(null)
    try {
      await billingAPI.sendEmail(doc._id, { to: emailTo, message })
      setResult({ type: 'success', text: `Email sent to ${emailTo}` })
    } catch (err: any) {
      setResult({ type: 'danger', text: err.response?.data?.message || 'Failed to send email' })
    } finally {
      setSending(false)
    }
  }

  const whatsappPhone = (doc.clientPhone || '').replace(/\D/g, '')
  const whatsappMsg = encodeURIComponent(defaultMessage)
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${whatsappMsg}`

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <IconifyIcon icon="ri:share-line" className="me-2" />
          Share {typeLabel} {doc.documentNumber}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {result && (
          <Alert variant={result.type} dismissible onClose={() => setResult(null)} className="mb-3">
            {result.text}
          </Alert>
        )}

        <Nav variant="tabs" className="mb-3">
          <NavItem>
            <NavLink active={tab === 'email'} onClick={() => setTab('email')} style={{ cursor: 'pointer' }}>
              <IconifyIcon icon="ri:mail-line" className="me-1" />Email
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink active={tab === 'whatsapp'} onClick={() => setTab('whatsapp')} style={{ cursor: 'pointer' }}>
              <IconifyIcon icon="ri:whatsapp-line" className="me-1" />WhatsApp
            </NavLink>
          </NavItem>
        </Nav>

        {tab === 'email' && (
          <Form onSubmit={handleSendEmail}>
            <Form.Group className="mb-3">
              <Form.Label>To</Form.Label>
              <Form.Control
                type="email"
                required
                value={emailTo}
                onChange={e => setEmailTo(e.target.value)}
                placeholder="client@example.com"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
            </Form.Group>
            <Button type="submit" variant="primary" disabled={sending} className="w-100">
              {sending
                ? <><IconifyIcon icon="ri:loader-4-line" className="me-1" />Sending...</>
                : <><IconifyIcon icon="ri:send-plane-line" className="me-1" />Send Email</>}
            </Button>
          </Form>
        )}

        {tab === 'whatsapp' && (
          <div>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                value={doc.clientPhone || ''}
                readOnly
                placeholder="No phone number on record"
              />
              <Form.Text className="text-muted">From client info on the document</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Message Preview</Form.Label>
              <Form.Control as="textarea" rows={6} value={defaultMessage} readOnly />
            </Form.Group>
            {whatsappPhone ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success w-100"
              >
                <IconifyIcon icon="ri:whatsapp-line" className="me-2" />
                Open in WhatsApp
              </a>
            ) : (
              <Alert variant="warning" className="mb-0">
                No phone number found on this document. Edit the document to add a client phone number.
              </Alert>
            )}
          </div>
        )}
      </Modal.Body>
    </Modal>
  )
}

export default ShareModal
