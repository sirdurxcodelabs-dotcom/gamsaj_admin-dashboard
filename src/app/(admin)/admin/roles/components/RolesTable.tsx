import { useState, useEffect } from 'react'
import { Button, Table, Badge, Spinner } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { roleAPI } from '@/services/api'
import RoleFormModal from './RoleFormModal'

interface Role {
  _id: string; name: string; slug: string; description?: string
  permissions: string[]; isSystem: boolean; isActive: boolean; createdAt: string
}

const RolesTable = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<Role | null>(null)

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const res = await roleAPI.getRoles()
      if (res.data.success) setRoles(res.data.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchRoles() }, [])

  const handleDelete = async (role: Role) => {
    if (role.isSystem) { alert('System roles cannot be deleted.'); return }
    if (!confirm(`Delete role "${role.name}"? Users assigned this role will lose it.`)) return
    try {
      const res = await roleAPI.deleteRole(role._id)
      if (res.data.success) fetchRoles()
      else alert(res.data.message)
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to delete') }
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-0">Roles</h4>
          <small className="text-muted">Manage roles and their permissions</small>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" onClick={fetchRoles} disabled={loading}>
            <IconifyIcon icon="ri:refresh-line" />
          </Button>
          <Button variant="primary" size="sm" onClick={() => { setSelected(null); setShowForm(true) }}>
            <IconifyIcon icon="ri:add-line" className="me-1" />Create Role
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><Spinner variant="primary" /><p className="mt-2 text-muted">Loading roles...</p></div>
      ) : (
        <div className="table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Role Name</th>
                <th>Description</th>
                <th>Permissions</th>
                <th>Type</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-5 text-muted">No roles found</td></tr>
              ) : roles.map(r => (
                <tr key={r._id}>
                  <td>
                    <div className="fw-medium">{r.name}</div>
                    <small className="text-muted font-monospace">{r.slug}</small>
                  </td>
                  <td><small className="text-muted">{r.description || '—'}</small></td>
                  <td>
                    <Badge bg="primary" pill>{r.permissions.length}</Badge>
                  </td>
                  <td>
                    {r.isSystem
                      ? <Badge bg="danger">System</Badge>
                      : <Badge bg="secondary">Custom</Badge>}
                  </td>
                  <td><small>{fmt(r.createdAt)}</small></td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button variant="light" size="sm" title="Edit" onClick={() => { setSelected(r); setShowForm(true) }}>
                        <IconifyIcon icon="ri:edit-line" />
                      </Button>
                      {!r.isSystem && (
                        <Button variant="light" size="sm" title="Delete" className="text-danger" onClick={() => handleDelete(r)}>
                          <IconifyIcon icon="ri:delete-bin-line" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <RoleFormModal show={showForm} onHide={() => setShowForm(false)} role={selected} onSuccess={fetchRoles} />
    </>
  )
}

export default RolesTable
