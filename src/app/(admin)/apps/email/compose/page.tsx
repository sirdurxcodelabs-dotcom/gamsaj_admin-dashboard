import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button, Card, Col, Form, Row, Alert, Spinner } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { connectionsAPI } from '@/services/api'

const EmailCompose = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const contactId = searchParams.get('contactId')
  const toEmail = searchParams.get('to') || ''
  const subjectParam = searchParams.get('subject') || ''

  const [contact, setContact] = useState<any>(null)
  const [loading, setLoading] = useState(!!contactId)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [formData, setFormData] = useState({
    to: toEmail,
    subject: subjectParam,
    message: '',
  })

  useEffect(() => {
    if (contactId) {
      fetchContact()
    }
  }, [contactId])

  const fetchContact = async () => {
    try {
      setLoading(true)
      const response = await connectionsAPI.getConnection(contactId!)
      setContact(response.data.data)
    } catch (error) {
      console.error('Error fetching contact:', error)
      setMessage({ type: 'error', text: 'Failed to load contact details' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setMessage({ type: '', text: '' })

    // Validation
    if (!formData.to || !formData.subject || !formData.message) {
      setMessage({ type: 'error', text: 'Please fill in all fields' })
      setSending(false)
      return
    }

    try {
      // TODO: Implement email sending via backend API
      // await emailAPI.sendEmail({
      //   to: formData.to,
      //   subject: formData.subject,
      //   message: formData.message,
      //   contactId: contactId,
      // })

      // For now, just update the contact status to "responded"
      if (contactId) {
        await connectionsAPI.updateConnection(contactId, { status: 'responded' })
      }

      setMessage({
        type: 'success',
        text: 'Email sent successfully! (Note: Email sending will be implemented with Nodemailer)',
      })

      // Reset form
      setTimeout(() => {
        navigate('/admin/connections')
      }, 2000)
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to send email',
      })
    } finally {
      setSending(false)
    }
  }

  const handleCancel = () => {
    navigate('/admin/connections')
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading contact details...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageTitle title="Compose Email" />
      
      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">
                  <IconifyIcon icon="mdi:email-edit" className="me-2" />
                  Compose Email Reply
                </h4>
                <Button variant="soft-secondary" size="sm" onClick={handleCancel}>
                  <IconifyIcon icon="mdi:arrow-left" className="me-1" />
                  Back to Connections
                </Button>
              </div>

              {message.text && (
                <Alert variant={message.type === 'success' ? 'success' : 'danger'} dismissible onClose={() => setMessage({ type: '', text: '' })}>
                  <IconifyIcon icon={message.type === 'success' ? 'mdi:check-circle' : 'mdi:alert-circle'} className="me-2" />
                  {message.text}
                </Alert>
              )}

              {/* Original Message */}
              {contact && (
                <Card className="bg-light mb-4">
                  <Card.Body>
                    <h6 className="mb-3">
                      <IconifyIcon icon="mdi:message-text" className="me-2" />
                      Original Message
                    </h6>
                    <div className="mb-2">
                      <strong>From:</strong> {contact.fullName} ({contact.email})
                    </div>
                    <div className="mb-2">
                      <strong>Subject:</strong> {contact.subject}
                    </div>
                    <div className="mb-2">
                      <strong>Reason:</strong> {contact.reasonForContact}
                    </div>
                    <div className="border-top pt-3 mt-3">
                      <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                        {contact.message}
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Reply Form */}
              <Form onSubmit={handleSend}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <IconifyIcon icon="mdi:email" className="me-1" />
                    To
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="to"
                    value={formData.to}
                    onChange={handleChange}
                    placeholder="recipient@example.com"
                    required
                    readOnly={!!contactId}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <IconifyIcon icon="mdi:text-subject" className="me-1" />
                    Subject
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Email subject"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>
                    <IconifyIcon icon="mdi:message-text" className="me-1" />
                    Message
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={10}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your reply here..."
                    required
                  />
                  <Form.Text className="text-muted">
                    Tip: Be professional and address the customer's concerns clearly.
                  </Form.Text>
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button variant="primary" type="submit" disabled={sending}>
                    <IconifyIcon icon="mdi:send" className="me-1" />
                    {sending ? 'Sending...' : 'Send Email'}
                  </Button>
                  <Button variant="secondary" onClick={handleCancel} disabled={sending}>
                    <IconifyIcon icon="mdi:close" className="me-1" />
                    Cancel
                  </Button>
                </div>
              </Form>

              {/* Note about Nodemailer */}
              <Alert variant="info" className="mt-4">
                <IconifyIcon icon="mdi:information" className="me-2" />
                <strong>Note:</strong> Email sending functionality will be implemented using Nodemailer. 
                For now, clicking "Send Email" will mark the contact as "Responded" in the system.
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default EmailCompose
