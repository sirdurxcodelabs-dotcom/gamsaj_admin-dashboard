import { useState } from 'react'
import { Button, Dropdown, Card, Badge } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { format } from 'date-fns'
import { emailAPI } from '@/services/api'

type EmailDetailProps = {
  email: any
  onClose: () => void
  onRefresh: () => void
  onReply: () => void
}

const EmailDetail = ({ email, onClose, onRefresh, onReply }: EmailDetailProps) => {
  const [loading, setLoading] = useState(false)

  const handleToggleStar = async () => {
    try {
      setLoading(true)
      await emailAPI.toggleStar(email._id)
      onRefresh()
    } catch (error) {
      console.error('Error toggling star:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleRead = async () => {
    try {
      setLoading(true)
      await emailAPI.toggleRead(email._id, !email.isRead)
      onRefresh()
    } catch (error) {
      console.error('Error toggling read:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this email?')) return

    try {
      setLoading(true)
      await emailAPI.deleteEmail(email._id)
      onClose()
      onRefresh()
    } catch (error) {
      console.error('Error deleting email:', error)
      alert('Failed to delete email')
    } finally {
      setLoading(false)
    }
  }

  const handleMoveToSpam = async () => {
    try {
      setLoading(true)
      await emailAPI.moveEmail(email._id, 'spam')
      onClose()
      onRefresh()
    } catch (error) {
      console.error('Error moving to spam:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarColor = (name: string) => {
    const colors = ['primary', 'success', 'info', 'warning', 'danger', 'secondary']
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <div className="email-detail flex-grow-1" style={{ overflowY: 'auto' }}>
      {/* Header */}
      <div className="p-3 border-bottom bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex gap-2">
            <Button variant="soft-secondary" size="sm" onClick={onClose}>
              <IconifyIcon icon="mdi:arrow-left" />
            </Button>
            <Button variant="soft-secondary" size="sm" onClick={onRefresh}>
              <IconifyIcon icon="mdi:refresh" />
            </Button>
          </div>
          <div className="d-flex gap-2">
            <Button variant="soft-primary" size="sm" onClick={onReply} disabled={loading}>
              <IconifyIcon icon="mdi:reply" className="me-1" />
              Reply
            </Button>
            <Button
              variant={email.isStarred ? 'warning' : 'soft-secondary'}
              size="sm"
              onClick={handleToggleStar}
              disabled={loading}
            >
              <IconifyIcon icon={email.isStarred ? 'mdi:star' : 'mdi:star-outline'} />
            </Button>
            <Dropdown>
              <Dropdown.Toggle variant="soft-secondary" size="sm" disabled={loading}>
                <IconifyIcon icon="mdi:dots-vertical" />
              </Dropdown.Toggle>
              <Dropdown.Menu align="end">
                <Dropdown.Item onClick={handleToggleRead}>
                  <IconifyIcon icon={email.isRead ? 'mdi:email' : 'mdi:email-open'} className="me-2" />
                  Mark as {email.isRead ? 'Unread' : 'Read'}
                </Dropdown.Item>
                <Dropdown.Item onClick={handleMoveToSpam}>
                  <IconifyIcon icon="mdi:alert-octagon" className="me-2" />
                  Move to Spam
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleDelete} className="text-danger">
                  <IconifyIcon icon="mdi:delete" className="me-2" />
                  Delete
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="p-4">
        {/* Subject */}
        <h4 className="mb-3">{email.subject}</h4>

        {/* Sender Info */}
        <Card className="mb-4">
          <Card.Body>
            <div className="d-flex align-items-start">
              <div
                className={`avatar-md rounded-circle bg-soft-${getAvatarColor(email.from.name || email.from.email)} text-${getAvatarColor(email.from.name || email.from.email)} d-flex align-items-center justify-content-center me-3`}
                style={{ width: '50px', height: '50px' }}
              >
                <span className="fw-bold fs-5">{getInitials(email.from.name || email.from.email)}</span>
              </div>
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-0">{email.from.name || email.from.email}</h6>
                    <small className="text-muted">{email.from.email}</small>
                  </div>
                  <small className="text-muted">{format(new Date(email.createdAt), 'MMM dd, yyyy HH:mm')}</small>
                </div>
                <div className="mt-2">
                  <small className="text-muted">
                    To: <span className="text-dark">{email.to.email}</span>
                  </small>
                </div>
                <div className="mt-2 d-flex gap-2">
                  {!email.isRead && (
                    <Badge bg="primary" className="text-uppercase">
                      New
                    </Badge>
                  )}
                  {email.isStarred && (
                    <Badge bg="warning" className="text-uppercase">
                      Starred
                    </Badge>
                  )}
                  {email.contactId && (
                    <Badge 
                      bg={email.contactId.type === 'contact' ? 'info' : 'success'} 
                      className="text-uppercase"
                    >
                      {email.contactId.type === 'contact' ? 'Contact Form' : 'Newsletter'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Email Body */}
        <Card>
          <Card.Body>
            {email.htmlBody ? (
              <div dangerouslySetInnerHTML={{ __html: email.htmlBody }} />
            ) : (
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{email.body}</div>
            )}
          </Card.Body>
        </Card>

        {/* Attachments */}
        {email.attachments && email.attachments.length > 0 && (
          <Card className="mt-3">
            <Card.Body>
              <h6 className="mb-3">
                <IconifyIcon icon="mdi:attachment" className="me-2" />
                Attachments ({email.attachments.length})
              </h6>
              <div className="d-flex flex-wrap gap-2">
                {email.attachments.map((attachment: any, index: number) => (
                  <div key={index} className="border rounded p-2 d-flex align-items-center">
                    <IconifyIcon icon="mdi:file" className="me-2 text-primary" />
                    <div>
                      <div className="small">{attachment.filename}</div>
                      <div className="text-muted" style={{ fontSize: '11px' }}>
                        {(attachment.size / 1024).toFixed(2)} KB
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="mt-4 d-flex gap-2">
          <Button variant="primary" onClick={onReply}>
            <IconifyIcon icon="mdi:reply" className="me-2" />
            Reply
          </Button>
          <Button variant="soft-primary">
            <IconifyIcon icon="mdi:reply-all" className="me-2" />
            Reply All
          </Button>
          <Button variant="soft-primary">
            <IconifyIcon icon="mdi:forward" className="me-2" />
            Forward
          </Button>
        </div>
      </div>
    </div>
  )
}

export default EmailDetail
