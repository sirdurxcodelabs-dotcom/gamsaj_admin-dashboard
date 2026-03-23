import { useState, useEffect, useCallback } from 'react'
import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row, Spinner, Badge, Button, Form, Alert } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { roleAPI } from '@/services/api'

interface Permission { _id: string; name: string; slug: string; category: string }
interface Role { _id: string; name: string; slug: string; permissions: string[]; isSystem: boolean }

const CATEGORY_COLORS: Record<string, string> = {
  main: '#0d6efd', app: '#0dcaf0', content: '#198754', pages: '#ffc107', admin: '#dc3545',
}

const RoleMatrixPage = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [matrix, setMatrix] = useState<Record<string, Set<string>>>({}) // roleId -> Set<permSlug>
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null) // roleId being saved
  const [dirty, setDirty] = useState<Set<string>>(new Set()) // roleIds with unsaved changes
  const [saved, setSaved] = useState<string | null>(null)
  const [filterCat, setFilterCat] = useState('')

  const fetchMatrix = useCallback(async () => {
    try {
      setLoading(true)
      const res = await roleAPI.getMatrix()
      if (res.data.success) {
        const { roles: r, permissions: p } = res.data.data
        setRoles(r)
        setPermissions(p)
        const m: Record<string, Set<string>> = {}
        r.forEach((role: Role) => { m[role._id] = new Set(role.permissions) })
        setMatrix(m)
        setDirty(new Set())
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchMatrix() }, [fetchMatrix])

  const toggleCell = (roleId: string, permSlug: string, isSystem: boolean) => {
    if (isSystem) return
    setMatrix(prev => {
      const next = { ...prev, [roleId]: new Set(prev[roleId]) }
      if (next[roleId].has(permSlug)) next[roleId].delete(permSlug)
      else next[roleId].add(permSlug)
      return next
    })
    setDirty(prev => new Set([...prev, roleId]))
  }

  const saveRole = async (roleId: string) => {
    try {
      setSaving(roleId)
      const perms = Array.from(matrix[roleId] || [])
      const res = await roleAPI.updateRolePermissions(roleId, perms)
      if (res.data.success) {
        setDirty(prev => { const n = new Set(prev); n.delete(roleId); return n })
        setSaved(roleId)
        setTimeout(() => setSaved(null), 2000)
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(null)
    }
  }

  const categories = [...new Set(permissions.map(p => p.category))]
  const filteredPerms = filterCat ? permissions.filter(p => p.category === filterCat) : permissions

  if (loading) {
    return (
      <>
        <PageTitle title="Role Permission Matrix" />
        <div className="text-center py-5"><Spinner variant="primary" /><p className="mt-2 text-muted">Loading matrix...</p></div>
      </>
    )
  }

  return (
    <>
      <PageTitle title="Role Permission Matrix" />
      <Row>
        <Col xs={12}>
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h4 className="mb-0">Role Permission Matrix</h4>
                  <small className="text-muted">{permissions.length} permissions × {roles.length} roles</small>
                </div>
                <div className="d-flex gap-2 align-items-center">
                  <Form.Select size="sm" value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ width: 160 }}>
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </Form.Select>
                  <Button variant="outline-secondary" size="sm" onClick={fetchMatrix}>
                    <IconifyIcon icon="ri:refresh-line" />
                  </Button>
                </div>
              </div>

              {dirty.size > 0 && (
                <Alert variant="warning" className="py-2 mb-3">
                  <IconifyIcon icon="ri:error-warning-line" className="me-1" />
                  You have unsaved changes. Click "Save" on each modified role column.
                </Alert>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table className="table table-bordered table-sm align-middle" style={{ minWidth: 600 }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ minWidth: 200, position: 'sticky', left: 0, background: '#f8f9fa', zIndex: 2 }}>
                        Permission
                      </th>
                      {roles.map(role => (
                        <th key={role._id} className="text-center" style={{ minWidth: 120 }}>
                          <div>{role.name}</div>
                          {role.isSystem
                            ? <Badge bg="danger" style={{ fontSize: '0.65rem' }}>System</Badge>
                            : (
                              <Button size="sm" variant={saved === role._id ? 'success' : dirty.has(role._id) ? 'warning' : 'outline-secondary'}
                                style={{ fontSize: '0.7rem', padding: '1px 6px', marginTop: 2 }}
                                onClick={() => saveRole(role._id)} disabled={saving === role._id || !dirty.has(role._id)}>
                                {saving === role._id ? <Spinner size="sm" /> : saved === role._id ? '✓ Saved' : 'Save'}
                              </Button>
                            )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {categories.filter(c => !filterCat || c === filterCat).map(cat => (
                      <>
                        <tr key={`cat-${cat}`} style={{ background: '#f0f4ff' }}>
                          <td colSpan={roles.length + 1} style={{ position: 'sticky', left: 0 }}>
                            <span className="fw-semibold text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.06em', color: CATEGORY_COLORS[cat] || '#666' }}>
                              {cat}
                            </span>
                          </td>
                        </tr>
                        {filteredPerms.filter(p => p.category === cat).map(perm => (
                          <tr key={perm._id}>
                            <td style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 1 }}>
                              <div style={{ fontSize: '0.85rem' }}>{perm.name}</div>
                              <code style={{ fontSize: '0.7rem', color: '#888' }}>{perm.slug}</code>
                            </td>
                            {roles.map(role => {
                              const has = matrix[role._id]?.has(perm.slug) ?? false
                              return (
                                <td key={role._id} className="text-center" style={{ cursor: role.isSystem ? 'default' : 'pointer' }}
                                  onClick={() => toggleCell(role._id, perm.slug, role.isSystem)}>
                                  {has ? (
                                    <IconifyIcon icon="ri:checkbox-circle-fill" style={{ color: '#198754', fontSize: 18 }} />
                                  ) : (
                                    <IconifyIcon icon="ri:checkbox-blank-circle-line" style={{ color: '#dee2e6', fontSize: 18 }} />
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default RoleMatrixPage
