import { useState, useEffect } from 'react'
import { Modal, Button, Form, Spinner, Alert, Badge, Row, Col } from 'react-bootstrap'
import { roleAPI } from '@/services/api'

interface Permission { _id: string; name: string; slug: string; category: string; description?: string }
interface Role { _id?: string; name: string; description?: string; permissions: string[]; isSystem?: boolean }
interface Props { show: boolean; onHide: () => void; role: Role | null; onSuccess: () => void }

const CATEGORY_LABELS: Record<string, string> = {
  main: 'Main', app: 'App', content: 'Content', pages: 'Pages', admin: 'Admin',
}

const RoleFormModal = ({ show, onHide, role, onSuccess }: Props) => {
  const isEdit = !!role?._id
  const [loading, setLoading] = useState(false)
  const [grouped, setGrouped] = useState<Record<string, Permission[]>>({})
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', description: '', permissions: [] as string[] })

  useEffect(() => {
    if (show) {
      setError('')
      fetchPermissions()
      setForm({
        name: role?.name || '',
        description: role?.description || '',
        permissions: role?.permissions || [],
      })
    }
  }, [show, role])

  const fetchPermissions = async () => {
    try {
      const res = await roleAPI.getAllPermissions()
      if (res.data.success) {
        setGrouped(res.data.grouped || {})
      }
    } catch { setError('Failed to load permissions') }
  }

  const togglePerm = (slug: string) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(slug)
        ? prev.permissions.filter(p => p !== slug)
        : [...prev.permissions, slug],
    }))
  }

  const toggleCategory = (cat: string) => {
    const catSlugs = (grouped[cat] || []).map(p => p.slug)
    const allSelected = catSlugs.every(s => form.permissions.includes(s))
    setForm(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter(p => !catSlugs.includes(p))
        : [...new Set([...prev.permissions, ...catSlugs])],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError('Role name is required'); return }

    try {
      setLoading(true)
      const res = isEdit
        ? await roleAPI.updateRole(role!._id!, form)
        : await roleAPI.createRole(form)

      if (res.data.success) { onSuccess(); onHide() }
      else setError(res.data.message || 'Operation failed')
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? 'Edit Role' : 'Create Role'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger" className="py-2">{error}</Alert>}
          {role?.isSystem && (
            <Alert variant="warning" className="py-2">System roles cannot be modified.</Alert>
          )}

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Role Name <span className="text-danger">*</span></Form.Label>
                <Form.Control value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Content Editor" required disabled={role?.isSystem} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description" disabled={role?.isSystem} />
              </Form.Group>
            </Col>
          </Row>

          <div className="mb-2 d-flex justify-content-between align-items-center">
            <strong>Permissions</strong>
            <Badge bg="primary">{form.permissions.length} selected</Badge>
          </div>

          {Object.entries(grouped).map(([cat, perms]) => {
            const catSlugs = perms.map(p => p.slug)
            const allSel = catSlugs.every(s => form.permissions.includes(s))
            const someSel = catSlugs.some(s => form.permissions.includes(s))
            return (
              <div key={cat} className="mb-3 border rounded p-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Form.Check type="checkbox" checked={allSel} ref={(el: any) => { if (el) el.indeterminate = someSel && !allSel }}
                    onChange={() => toggleCategory(cat)} disabled={role?.isSystem} id={`cat-${cat}`} />
                  <label htmlFor={`cat-${cat}`} className="fw-semibold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em', cursor: 'pointer' }}>
                    {CATEGORY_LABELS[cat] || cat}
                  </label>
                </div>
                <div className="row g-2">
                  {perms.map(p => (
                    <div key={p.slug} className="col-md-6 col-lg-4">
                      <Form.Check type="checkbox" id={`perm-${p.slug}`}
                        label={<span title={p.description || ''}>{p.name}</span>}
                        checked={form.permissions.includes(p.slug)}
                        onChange={() => togglePerm(p.slug)} disabled={role?.isSystem} />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>Cancel</Button>
          {!role?.isSystem && (
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? <><Spinner size="sm" className="me-1" />Saving...</> : isEdit ? 'Update Role' : 'Create Role'}
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default RoleFormModal
