import { useState, useEffect } from 'react'
import { Table, Badge, Button, Spinner, Pagination, Form } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { connectionsAPI } from '@/services/api'
import { format } from 'date-fns'
import ContactDetailModal from './ContactDetailModal.tsx'

type ContactsTableProps = {
  searchTerm: string
  statusFilter: string
  canManage: boolean
  canDelete: boolean
  refreshKey: number
  onRefresh: () => void
}

const ContactsTable = ({ searchTerm, statusFilter, canManage, canDelete, refreshKey, onRefresh }: ContactsTableProps) => {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    fetchContacts()
  }, [page, searchTerm, statusFilter, refreshKey])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const response = await connectionsAPI.getConnections({
        type: 'contact',
        status: statusFilter || undefined,
        search: searchTerm || undefined,
        page,
        limit: 10,
      })
      setContacts(response.data.data)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewContact = async (id: string) => {
    try {
      const response = await connectionsAPI.getConnection(id)
      setSelectedContact(response.data.data)
      setShowDetailModal(true)
    } catch (error) {
      console.error('Error fetching contact:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return

    try {
      await connectionsAPI.deleteConnection(id)
      onRefresh()
    } catch (error) {
      console.error('Error deleting contact:', error)
      alert('Failed to delete contact')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} contact(s)?`)) return

    try {
      await connectionsAPI.bulkDeleteConnections(selectedIds)
      setSelectedIds([])
      onRefresh()
    } catch (error) {
      console.error('Error bulk deleting:', error)
      alert('Failed to delete contacts')
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === contacts.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(contacts.map((c) => c._id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      new: 'warning',
      read: 'info',
      responded: 'success',
      archived: 'secondary',
    }
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  return (
    <>
      {selectedIds.length > 0 && canDelete && (
        <div className="mb-3">
          <Button variant="danger" size="sm" onClick={handleBulkDelete}>
            <IconifyIcon icon="mdi:delete" className="me-1" />
            Delete Selected ({selectedIds.length})
          </Button>
        </div>
      )}

      <div className="table-responsive">
        <Table hover className="mb-0">
          <thead className="table-light">
            <tr>
              {canDelete && (
                <th style={{ width: '40px' }}>
                  <Form.Check
                    type="checkbox"
                    checked={selectedIds.length === contacts.length && contacts.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
              )}
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Subject</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Date</th>
              <th style={{ width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={canDelete ? 9 : 8} className="text-center py-4 text-muted">
                  No contacts found
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr key={contact._id}>
                  {canDelete && (
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={selectedIds.includes(contact._id)}
                        onChange={() => toggleSelect(contact._id)}
                      />
                    </td>
                  )}
                  <td>{contact.fullName}</td>
                  <td>{contact.email}</td>
                  <td>{contact.phone}</td>
                  <td>{contact.subject}</td>
                  <td>{contact.reasonForContact || '-'}</td>
                  <td>{getStatusBadge(contact.status)}</td>
                  <td>{format(new Date(contact.createdAt), 'MMM dd, yyyy')}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button
                        variant="soft-primary"
                        size="sm"
                        onClick={() => handleViewContact(contact._id)}
                      >
                        <IconifyIcon icon="mdi:eye" />
                      </Button>
                      {canDelete && (
                        <Button
                          variant="soft-danger"
                          size="sm"
                          onClick={() => handleDelete(contact._id)}
                        >
                          <IconifyIcon icon="mdi:delete" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            <Pagination.Prev disabled={page === 1} onClick={() => setPage(page - 1)} />
            {[...Array(totalPages)].map((_, i) => (
              <Pagination.Item key={i + 1} active={page === i + 1} onClick={() => setPage(i + 1)}>
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next disabled={page === totalPages} onClick={() => setPage(page + 1)} />
          </Pagination>
        </div>
      )}

      {selectedContact && (
        <ContactDetailModal
          show={showDetailModal}
          contact={selectedContact}
          canManage={canManage}
          onHide={() => {
            setShowDetailModal(false)
            setSelectedContact(null)
          }}
          onUpdate={() => {
            setShowDetailModal(false)
            setSelectedContact(null)
            onRefresh()
          }}
        />
      )}
    </>
  )
}

export default ContactsTable
