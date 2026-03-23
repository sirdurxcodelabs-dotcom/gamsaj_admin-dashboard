import { useState, useEffect, useCallback } from 'react'
import { Button, Table, Badge, Spinner, Form, InputGroup, Row, Col } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { userAPI, roleAPI } from '@/services/api'
import UserFormModal from './UserFormModal'
import UserViewModal from './UserViewModal'

interface User {
  _id: string; name: string; email: string
  role?: { _id: string; name: string; slug: string } | null
  isActive: boolean; isVerified: boolean; permissions?: string[]
  avatar?: string; phone?: string; location?: string; createdAt: string
}
interface Role { _id: string; name: string; slug: string }

const UsersTable = () => {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [showView, setShowView] = useState(false)
  const [selected, setSelected] = useState<User | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await userAPI.getUsers({ search, role: filterRole, status: filterStatus, page, limit: 20 })
      if (res.data.success) {
        setUsers(res.data.data)
        setTotalPages(res.data.pages || 1)
      }
    } catch (err) {
      console.error('Failed to fetch users', err)
    } finally {
      setLoading(false)
    }
  }, [search, filterRole, filterStatus, page])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  useEffect(() => {
    roleAPI.getRoles().then(res => { if (res.data.success) setRoles(res.data.data) }).catch(() => {})
  }, [])

  const handleToggleActive = async (user: User) => {
    if (!confirm(`${user.isActive ? 'Deactivate' : 'Activate'} ${user.name}?`)) return
    try {
      const res = await userAPI.toggleActive(user._id)
      if (res.data.success) fetchUsers()
      else alert(res.data.message)
    } catch (err: any) { alert(err.response?.data?.message || 'Failed') }
  }

  const handleDelete = async (user: User) => {
    if (!confirm(`Delete ${user.name}? This cannot be undone.`)) return
    try {
      const res = await userAPI.deleteUser(user._id)
      if (res.data.success) fetchUsers()
      else alert(res.data.message)
    } catch (err: any) { alert(err.response?.data?.message || 'Failed') }
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-0">Users</h4>
          <small className="text-muted">Manage system users and their roles</small>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" onClick={fetchUsers} disabled={loading}>
            <IconifyIcon icon="ri:refresh-line" />
          </Button>
          <Button variant="primary" size="sm" onClick={() => { setSelected(null); setShowForm(true) }}>
            <IconifyIcon icon="ri:add-line" className="me-1" />Create User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Row className="g-2 mb-3">
        <Col md={5}>
          <InputGroup size="sm">
            <InputGroup.Text><IconifyIcon icon="ri:search-line" /></InputGroup.Text>
            <Form.Control placeholder="Search name or email..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select size="sm" value={filterRole} onChange={e => { setFilterRole(e.target.value); setPage(1) }}>
            <option value="">All Roles</option>
            {roles.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select size="sm" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Table */}
      {loading ? (
        <div className="text-center py-5"><Spinner variant="primary" /><p className="mt-2 text-muted">Loading users...</p></div>
      ) : (
        <div className="table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Verified</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-5 text-muted">
                  <IconifyIcon icon="ri:user-line" className="fs-1 d-block mx-auto mb-2" />
                  No users found
                </td></tr>
              ) : users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="rounded-circle" style={{ width: 36, height: 36, objectFit: 'cover' }} />
                      ) : (
                        <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
                          style={{ width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="fw-medium">{u.name}</div>
                        <small className="text-muted">{u.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    {u.role ? <Badge bg="primary" pill>{u.role.name}</Badge> : <span className="text-muted">—</span>}
                  </td>
                  <td>
                    <Badge bg={u.isActive ? 'success' : 'secondary'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td>
                    <Badge bg={u.isVerified ? 'info' : 'warning'}>{u.isVerified ? 'Verified' : 'Unverified'}</Badge>
                  </td>
                  <td><small>{fmt(u.createdAt)}</small></td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button variant="light" size="sm" title="View" onClick={() => { setSelected(u); setShowView(true) }}>
                        <IconifyIcon icon="ri:eye-line" />
                      </Button>
                      <Button variant="light" size="sm" title="Edit" onClick={() => { setSelected(u); setShowForm(true) }}>
                        <IconifyIcon icon="ri:edit-line" />
                      </Button>
                      <Button variant="light" size="sm" title={u.isActive ? 'Deactivate' : 'Activate'}
                        className={u.isActive ? 'text-warning' : 'text-success'} onClick={() => handleToggleActive(u)}>
                        <IconifyIcon icon={u.isActive ? 'ri:user-unfollow-line' : 'ri:user-follow-line'} />
                      </Button>
                      <Button variant="light" size="sm" title="Delete" className="text-danger" onClick={() => handleDelete(u)}>
                        <IconifyIcon icon="ri:delete-bin-line" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center gap-2 mt-3">
          <Button size="sm" variant="outline-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            <IconifyIcon icon="ri:arrow-left-line" />
          </Button>
          <span className="align-self-center small">Page {page} of {totalPages}</span>
          <Button size="sm" variant="outline-secondary" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            <IconifyIcon icon="ri:arrow-right-line" />
          </Button>
        </div>
      )}

      <UserFormModal show={showForm} onHide={() => setShowForm(false)} user={selected} onSuccess={fetchUsers} />
      <UserViewModal show={showView} onHide={() => setShowView(false)} user={selected}
        onEdit={u => { setSelected(u); setShowView(false); setShowForm(true) }} />
    </>
  )
}

export default UsersTable
