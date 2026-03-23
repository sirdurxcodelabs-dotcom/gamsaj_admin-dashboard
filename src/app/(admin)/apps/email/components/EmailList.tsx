import { useState } from 'react'
import { Form, InputGroup, Button, Spinner, Dropdown } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { format } from 'date-fns'
import { emailAPI } from '@/services/api'

type EmailListProps = {
  emails: any[]
  loading: boolean
  selectedEmail: any
  onEmailSelect: (email: any) => void
  onRefresh: () => void
  currentFolder: string
}

const EmailList = ({ emails, loading, selectedEmail, onEmailSelect, onRefresh, currentFolder }: EmailListProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkLoading, setBulkLoading] = useState(false)

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === emails.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(emails.map((e) => e._id))
    }
  }

  const handleBulkAction = async (operation: string, value?: string) => {
    if (selectedIds.length === 0) return

    try {
      setBulkLoading(true)
      await emailAPI.bulkOperation({ ids: selectedIds, operation: operation as any, value })
      setSelectedIds([])
      onRefresh()
    } catch (error) {
      console.error('Bulk operation error:', error)
      alert('Failed to perform bulk operation')
    } finally {
      setBulkLoading(false)
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

  const filteredEmails = emails.filter(
    (email) =>
      email.from.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.from.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="email-list border-end" style={{ width: '400px', minWidth: '400px', overflowY: 'auto' }}>
      {/* Search and Actions */}
      <div className="p-3 border-bottom bg-light">
        <InputGroup className="mb-2">
          <InputGroup.Text>
            <IconifyIcon icon="mdi:magnify" />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        {selectedIds.length > 0 && (
          <div className="d-flex gap-2 align-items-center">
            <Form.Check
              type="checkbox"
              checked={selectedIds.length === emails.length}
              onChange={toggleSelectAll}
              label={`${selectedIds.length} selected`}
            />
            <Dropdown>
              <Dropdown.Toggle variant="soft-primary" size="sm" disabled={bulkLoading}>
                <IconifyIcon icon="mdi:dots-vertical" />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleBulkAction('markRead')}>
                  <IconifyIcon icon="mdi:email-open" className="me-2" />
                  Mark as Read
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleBulkAction('markUnread')}>
                  <IconifyIcon icon="mdi:email" className="me-2" />
                  Mark as Unread
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleBulkAction('star')}>
                  <IconifyIcon icon="mdi:star" className="me-2" />
                  Star
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => handleBulkAction('delete')} className="text-danger">
                  <IconifyIcon icon="mdi:delete" className="me-2" />
                  Delete
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Button variant="soft-secondary" size="sm" onClick={onRefresh}>
              <IconifyIcon icon="mdi:refresh" />
            </Button>
          </div>
        )}
      </div>

      {/* Email List */}
      <div>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Loading emails...</p>
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="text-center py-5">
            <IconifyIcon icon="mdi:email-outline" className="fs-1 text-muted" />
            <p className="mt-2 text-muted">
              {searchTerm ? 'No emails found matching your search' : `No emails in ${currentFolder}`}
            </p>
          </div>
        ) : (
          filteredEmails.map((email) => (
            <div
              key={email._id}
              className={`email-item p-3 border-bottom ${selectedEmail?._id === email._id ? 'bg-light' : ''} ${
                !email.isRead ? 'fw-bold' : ''
              }`}
              style={{ cursor: 'pointer' }}
              onClick={() => onEmailSelect(email)}
            >
              <div className="d-flex align-items-start">
                {selectedIds.length > 0 && (
                  <Form.Check
                    type="checkbox"
                    checked={selectedIds.includes(email._id)}
                    onChange={(e) => {
                      e.stopPropagation()
                      toggleSelect(email._id)
                    }}
                    className="me-2"
                  />
                )}
                <div
                  className={`avatar-sm rounded-circle bg-soft-${getAvatarColor(email.from.name || email.from.email)} text-${getAvatarColor(email.from.name || email.from.email)} d-flex align-items-center justify-content-center me-3 flex-shrink-0`}
                  style={{ width: '40px', height: '40px' }}
                >
                  <span className="fw-bold">{getInitials(email.from.name || email.from.email)}</span>
                </div>
                <div className="flex-grow-1 overflow-hidden">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <span className={`${!email.isRead ? 'fw-bold' : ''}`}>{email.from.name || email.from.email}</span>
                    <small className="text-muted flex-shrink-0 ms-2">
                      {format(new Date(email.createdAt), 'MMM dd')}
                    </small>
                  </div>
                  <div className="text-truncate mb-1">
                    <span className={`${!email.isRead ? 'fw-bold' : ''}`}>{email.subject}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    {!email.isRead && (
                      <span className="badge bg-primary" style={{ fontSize: '10px' }}>
                        NEW
                      </span>
                    )}
                    {email.isStarred && <IconifyIcon icon="mdi:star" className="text-warning" />}
                    {email.contactId && (
                      <span 
                        className={`badge ${
                          email.contactId.type === 'contact' 
                            ? 'bg-soft-info text-info' 
                            : 'bg-soft-success text-success'
                        }`} 
                        style={{ fontSize: '10px' }}
                      >
                        {email.contactId.type === 'contact' ? 'Contact' : 'Newsletter'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default EmailList
