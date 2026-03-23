import { useState, useEffect } from 'react'
import { Modal, Button, Form, Alert } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { emailAPI } from '@/services/api'

type ComposeModalProps = {
  show: boolean
  onHide: () => void
  onSent: () => void
  replyTo?: any
}

const ComposeModal = ({ show, onHide, onSent, replyTo }: ComposeModalProps) => {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    message: '',
  })
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [includeOriginal, setIncludeOriginal] = useState(true)
  const [originalMessage, setOriginalMessage] = useState('')
  const [draftId, setDraftId] = useState<string | null>(null)
  const [savingDraft, setSavingDraft] = useState(false)

  useEffect(() => {
    if (replyTo) {
      const original = `\n\n---\nOn ${new Date(replyTo.createdAt).toLocaleString()}, ${replyTo.from.name || replyTo.from.email} wrote:\n${replyTo.body}`
      setOriginalMessage(original)
      setFormData({
        to: replyTo.from.email,
        subject: replyTo.subject.startsWith('Re:') ? replyTo.subject : `Re: ${replyTo.subject}`,
        message: original,
      })
      setIncludeOriginal(true)
    } else {
      setFormData({ to: '', subject: '', message: '' })
      setOriginalMessage('')
      setIncludeOriginal(true)
    }
    setMessage({ type: '', text: '' })
  }, [replyTo, show])

  const handleIncludeOriginalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setIncludeOriginal(checked)
    
    if (replyTo) {
      if (checked) {
        // Add original message back
        setFormData({
          ...formData,
          message: formData.message + originalMessage,
        })
      } else {
        // Remove original message
        setFormData({
          ...formData,
          message: formData.message.replace(originalMessage, '').trim(),
        })
      }
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
      await emailAPI.sendEmail({
        to: formData.to,
        subject: formData.subject,
        message: formData.message,
        contactId: replyTo?.contactId,
        replyTo: replyTo?._id,
      })

      setMessage({ type: 'success', text: 'Email sent successfully!' })
      setTimeout(() => {
        onSent()
        onHide()
      }, 1000)
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to send email',
      })
    } finally {
      setSending(false)
    }
  }

  const handleSaveDraft = async () => {
    try {
      setSavingDraft(true)
      setMessage({ type: '', text: '' })

      const response = await emailAPI.saveDraft({
        to: formData.to,
        subject: formData.subject,
        message: formData.message,
        contactId: replyTo?.contactId,
        replyTo: replyTo?._id,
        draftId: draftId || undefined,
      })

      setDraftId(response.data.data._id)
      setMessage({ type: 'success', text: 'Draft saved successfully!' })
      
      setTimeout(() => {
        onSent() // Refresh email list
        onHide()
      }, 1000)
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to save draft',
      })
    } finally {
      setSavingDraft(false)
    }
  }

  const handleClose = async () => {
    // If there's content and not sent, ask to save as draft
    if ((formData.to || formData.subject || formData.message) && !sending) {
      const action = confirm('Do you want to save this as a draft?\n\nClick OK to save as draft, or Cancel to discard.')
      
      if (action) {
        await handleSaveDraft()
        return
      }
    }
    
    onHide()
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <IconifyIcon icon="mdi:email-edit" className="me-2" />
          {replyTo ? 'Reply to Email' : 'Compose Email'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSend}>
        <Modal.Body>
          {message.text && (
            <Alert variant={message.type === 'success' ? 'success' : 'danger'} dismissible onClose={() => setMessage({ type: '', text: '' })}>
              <IconifyIcon icon={message.type === 'success' ? 'mdi:check-circle' : 'mdi:alert-circle'} className="me-2" />
              {message.text}
            </Alert>
          )}

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
              readOnly={!!replyTo}
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

          <Form.Group className="mb-3">
            <Form.Label>
              <IconifyIcon icon="mdi:message-text" className="me-1" />
              Message
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={12}
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your message here..."
              required
              style={{ fontFamily: 'monospace' }}
            />
            {replyTo && (
              <Form.Check
                type="checkbox"
                id="include-original"
                label="Include original message"
                checked={includeOriginal}
                onChange={handleIncludeOriginalChange}
                className="mt-2"
              />
            )}
            <Form.Text className="text-muted d-block mt-1">
              Tip: Be professional and clear in your communication.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={sending || savingDraft}>
            <IconifyIcon icon="mdi:close" className="me-1" />
            Cancel
          </Button>
          <Button variant="info" onClick={handleSaveDraft} disabled={sending || savingDraft}>
            <IconifyIcon icon="mdi:content-save" className="me-1" />
            {savingDraft ? 'Saving...' : 'Save as Draft'}
          </Button>
          <Button variant="primary" type="submit" disabled={sending || savingDraft}>
            <IconifyIcon icon="mdi:send" className="me-1" />
            {sending ? 'Sending...' : 'Send Email'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default ComposeModal
