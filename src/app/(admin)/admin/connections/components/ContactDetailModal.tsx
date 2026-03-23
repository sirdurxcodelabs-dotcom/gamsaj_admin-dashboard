import { useState, useEffect } from 'react'
import { Modal, Button, Form, Badge, Card, Spinner } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { connectionsAPI } from '@/services/api'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'

type ContactDetailModalProps = {
  show: boolean
  contact: any
  canManage: boolean
  onHide: () => void
  onUpdate: () => void
}

const ContactDetailModal = ({ show, contact, canManage, onHide, onUpdate }: ContactDetailModalProps) => {
  const navigate = useNavigate()
  const [status, setStatus] = useState(contact.status)
  const [adminNotes, setAdminNotes] = useState(contact.adminNotes || '')
  const [updating, setUpdating] = useState(false)
  const [replyEmails, setReplyEmails] = useState<any[]>([])
  const [loadingReply, setLoadingReply] = useState(false)

  // Fetch reply emails when modal opens
  useEffect(() => {
    if (show && contact._id) {
      fetchReplyEmails()
    }
  }, [show, contact._id])

  const fetchReplyEmails = async () => {
    try {
      setLoadingReply(true)
      // Use the connections API to get all replies for this connection
      const response = await connectionsAPI.getConnectionReply(contact._id)
      setReplyEmails(response.data.data || [])
    } catch (error: any) {
      // If 404, no replies exist yet
      if (error.response?.status === 404) {
        setReplyEmails([])
      } else {
        console.error('Error fetching reply emails:', error)
      }
    } finally {
      setLoadingReply(false)
    }
  }

  const handleUpdate = async () => {
    try {
      setUpdating(true)
      await connectionsAPI.updateConnection(contact._id, { status, adminNotes })
      onUpdate()
    } catch (error) {
      console.error('Error updating contact:', error)
      alert('Failed to update contact')
    } finally {
      setUpdating(false)
    }
  }

  const handleReply = () => {
    // Navigate to email compose with contact details
    navigate(`/apps/email/compose?contactId=${contact._id}&to=${contact.email}&subject=Re: ${contact.subject}`)
    onHide()
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      new: 'warning',
      read: 'info',
      responded: 'success',
      archived: 'secondary',
    }
    return <Badge bg={variants[status] || 'secondary'} className="text-uppercase">{status}</Badge>
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-bottom">
        <Modal.Title>
          <IconifyIcon icon="mdi:email-open" className="me-2 text-primary" />
          Contact Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {/* Header Section */}
        <Card className="border-0 bg-light mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h4 className="mb-1">{contact.fullName}</h4>
                <p className="text-muted mb-0">
                  <IconifyIcon icon="mdi:email" className="me-1" />
                  <a href={`mailto:${contact.email}`} className="text-decoration-none">
                    {contact.email}
                  </a>
                </p>
              </div>
              {getStatusBadge(contact.status)}
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <div className="d-flex align-items-center">
                  <IconifyIcon icon="mdi:phone" className="me-2 text-primary fs-18" />
                  <div>
                    <small className="text-muted d-block">Phone</small>
                    <a href={`tel:${contact.phone}`} className="text-decoration-none">
                      {contact.phone}
                    </a>
                  </div>
                </div>
              </div>
              {contact.company && (
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <IconifyIcon icon="mdi:office-building" className="me-2 text-primary fs-18" />
                    <div>
                      <small className="text-muted d-block">Company</small>
                      <span>{contact.company}</span>
                    </div>
                  </div>
                </div>
              )}
              {contact.reasonForContact && (
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <IconifyIcon icon="mdi:tag" className="me-2 text-primary fs-18" />
                    <div>
                      <small className="text-muted d-block">Reason</small>
                      <span>{contact.reasonForContact}</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="col-md-6">
                <div className="d-flex align-items-center">
                  <IconifyIcon icon="mdi:calendar" className="me-2 text-primary fs-18" />
                  <div>
                    <small className="text-muted d-block">Received</small>
                    <span>{format(new Date(contact.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Subject Section */}
        <div className="mb-4">
          <h6 className="text-muted mb-2">
            <IconifyIcon icon="mdi:text-subject" className="me-2" />
            Subject
          </h6>
          <Card className="border">
            <Card.Body>
              <p className="mb-0 fw-semibold">{contact.subject}</p>
            </Card.Body>
          </Card>
        </div>

        {/* Message Section */}
        <div className="mb-4">
          <h6 className="text-muted mb-2">
            <IconifyIcon icon="mdi:message-text" className="me-2" />
            Message
          </h6>
          <Card className="border">
            <Card.Body>
              <p className="mb-0" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {contact.message}
              </p>
            </Card.Body>
          </Card>
        </div>

        {/* Response Info */}
        {contact.respondedAt && (
          <div className="mb-4">
            <Card className="border-start border-success border-3 bg-light">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <IconifyIcon icon="mdi:check-circle" className="me-2 text-success fs-20" />
                  <div>
                    <small className="text-muted d-block">Responded</small>
                    <span>{format(new Date(contact.respondedAt), 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        )}

        {/* Reply Email Section - Conversation Thread */}
        {(contact.status === 'responded' || replyEmails.length > 0) && (
          <div className="mb-4">
            <h6 className="text-muted mb-2">
              <IconifyIcon icon="mdi:reply-all" className="me-2" />
              Conversation Thread {replyEmails.length > 0 && `(${replyEmails.length} ${replyEmails.length === 1 ? 'reply' : 'replies'})`}
            </h6>
            {loadingReply ? (
              <Card className="border">
                <Card.Body className="text-center py-4">
                  <Spinner animation="border" size="sm" variant="primary" />
                  <p className="mt-2 mb-0 text-muted">Loading conversation...</p>
                </Card.Body>
              </Card>
            ) : replyEmails.length > 0 ? (
              <div className="conversation-thread">
                {replyEmails.map((reply, index) => (
                  <Card key={reply._id} className="border border-success mb-3">
                    <Card.Header className="bg-soft-success">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>Reply #{index + 1}:</strong> {reply.subject}
                        </div>
                        <small className="text-muted">
                          {format(new Date(reply.sentAt || reply.createdAt), 'MMM dd, yyyy HH:mm')}
                        </small>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-2">
                        <small className="text-muted">From:</small>{' '}
                        <strong>{reply.userId?.name || reply.from.name || reply.from.email}</strong>
                        {reply.userId?.email && (
                          <small className="text-muted ms-1">({reply.userId.email})</small>
                        )}
                      </div>
                      <div className="mb-3">
                        <small className="text-muted">To:</small>{' '}
                        <strong>{reply.to.email}</strong>
                      </div>
                      <hr />
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                        {reply.body}
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            ) : contact.status === 'responded' ? (
              <Card className="border border-warning">
                <Card.Body className="text-center py-3">
                  <IconifyIcon icon="mdi:information" className="text-warning fs-20 mb-2" />
                  <p className="mb-0 text-muted">
                    Status is marked as responded but no reply emails found in the system.
                  </p>
                  <small className="text-muted">
                    The reply may have been sent outside the system or the email record is missing.
                  </small>
                </Card.Body>
              </Card>
            ) : null}
          </div>
        )}

        {/* Admin Actions */}
        {canManage && (
          <div className="border-top pt-4">
            <h6 className="mb-3">
              <IconifyIcon icon="mdi:shield-account" className="me-2" />
              Admin Actions
            </h6>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="responded">Responded</option>
                <option value="archived">Archived</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Admin Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes about this contact..."
              />
            </Form.Group>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="border-top">
        <Button variant="secondary" onClick={onHide}>
          <IconifyIcon icon="mdi:close" className="me-1" />
          Close
        </Button>
        <Button variant="primary" onClick={handleReply}>
          <IconifyIcon icon="mdi:reply" className="me-1" />
          Reply via Email
        </Button>
        {canManage && (
          <Button variant="success" onClick={handleUpdate} disabled={updating}>
            <IconifyIcon icon="mdi:content-save" className="me-1" />
            {updating ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  )
}

export default ContactDetailModal
