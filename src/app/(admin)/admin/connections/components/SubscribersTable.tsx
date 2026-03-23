import { useState, useEffect } from 'react'
import { Table, Button, Spinner, Pagination, Form } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { connectionsAPI } from '@/services/api'
import { format } from 'date-fns'

type SubscribersTableProps = {
  searchTerm: string
  canDelete: boolean
  refreshKey: number
  onRefresh: () => void
}

const SubscribersTable = ({ searchTerm, canDelete, refreshKey, onRefresh }: SubscribersTableProps) => {
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    fetchSubscribers()
  }, [page, searchTerm, refreshKey])

  const fetchSubscribers = async () => {
    try {
      setLoading(true)
      const response = await connectionsAPI.getConnections({
        type: 'subscriber',
        search: searchTerm || undefined,
        page,
        limit: 10,
      })
      setSubscribers(response.data.data)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      console.error('Error fetching subscribers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return

    try {
      await connectionsAPI.deleteConnection(id)
      onRefresh()
    } catch (error) {
      console.error('Error deleting subscriber:', error)
      alert('Failed to delete subscriber')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} subscriber(s)?`)) return

    try {
      await connectionsAPI.bulkDeleteConnections(selectedIds)
      setSelectedIds([])
      onRefresh()
    } catch (error) {
      console.error('Error bulk deleting:', error)
      alert('Failed to delete subscribers')
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === subscribers.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(subscribers.map((s) => s._id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
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
                    checked={selectedIds.length === subscribers.length && subscribers.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
              )}
              <th>Email</th>
              <th>Subscribed Date</th>
              <th>IP Address</th>
              {canDelete && <th style={{ width: '80px' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {subscribers.length === 0 ? (
              <tr>
                <td colSpan={canDelete ? 4 : 3} className="text-center py-4 text-muted">
                  No subscribers found
                </td>
              </tr>
            ) : (
              subscribers.map((subscriber) => (
                <tr key={subscriber._id}>
                  {canDelete && (
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={selectedIds.includes(subscriber._id)}
                        onChange={() => toggleSelect(subscriber._id)}
                      />
                    </td>
                  )}
                  <td>{subscriber.email}</td>
                  <td>{format(new Date(subscriber.createdAt), 'MMM dd, yyyy HH:mm')}</td>
                  <td>{subscriber.ipAddress || '-'}</td>
                  {canDelete && (
                    <td>
                      <Button
                        variant="soft-danger"
                        size="sm"
                        onClick={() => handleDelete(subscriber._id)}
                      >
                        <IconifyIcon icon="mdi:delete" />
                      </Button>
                    </td>
                  )}
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
    </>
  )
}

export default SubscribersTable
