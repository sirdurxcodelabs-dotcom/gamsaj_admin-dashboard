import { useEffect, useState } from 'react'
import { Alert, Badge, Button, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { teamAPI, uploadAPI } from '@/services/api'
import UserAvatar from '@/components/UserAvatar'

const EMPTY = {
  name: '', designation: '', phone: '', email: '',
  facebook: '', twitter: '', instagram: '', linkedin: '',
  bio: '', order: 0, isActive: true,
}

const TeamMembersTab = () => {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  const [showModal, setShowModal] = useState(false)
  const [editMember, setEditMember] = useState<any>(null)
  const [form, setForm] = useState<any>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await teamAPI.getAll({ active: 'false' })
      setMembers(res.data.data || [])
    } catch { setMembers([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.designation.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const openCreate = () => { setEditMember(null); setForm(EMPTY); setPhotoFile(null); setPhotoPreview(null); setShowModal(true) }
  const openEdit = (m: any) => { setEditMember(m); setForm({ ...m }); setPhotoFile(null); setPhotoPreview(null); setShowModal(true) }

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = ev => setPhotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      let photoUrl = form.photo || ''
      let photoPublicId = form.photoPublicId || ''
      if (photoFile) {
        try {
          const up = await uploadAPI.uploadSingle(photoFile)
          photoUrl = up.data.data.url
          photoPublicId = up.data.data.filename || ''
        } catch { setMsg({ type: 'danger', text: 'Photo upload failed. Saving without photo.' }) }
      }
      const payload = { ...form, photo: photoUrl, photoPublicId }
      if (editMember) {
        await teamAPI.update(editMember._id, payload)
      } else {
        await teamAPI.create(payload)
      }
      setMsg({ type: 'success', text: editMember ? 'Updated successfully' : 'Team member added' })
      setShowModal(false)
      fetch()
    } catch (err: any) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Save failed' })
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this team member?')) return
    await teamAPI.remove(id)
    fetch()
  }

  const set = (f: string, v: any) => setForm((p: any) => ({ ...p, [f]: v }))

  return (
    <>
      {msg && <Alert variant={msg.type} dismissible onClose={() => setMsg(null)} className="mb-3">{msg.text}</Alert>}

      <Row className="mb-3 align-items-center">
        <Col>
          <Form.Control
            size="sm" placeholder="Search by name or designation..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{ maxWidth: 300 }}
          />
        </Col>
        <Col xs="auto">
          <Button size="sm" variant="primary" onClick={openCreate}>
            <IconifyIcon icon="ri:user-add-line" className="me-1" />Add Member
          </Button>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-4"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <>
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light-subtle">
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-muted py-4">No team members found</td></tr>
                ) : paged.map((m, i) => (
                  <tr key={m._id}>
                    <td>{(page - 1) * PER_PAGE + i + 1}</td>
                    <td>
                      <UserAvatar src={m.photo || undefined} alt={m.name} size={40} className="rounded-circle" />
                    </td>
                    <td className="fw-semibold">{m.name}</td>
                    <td className="text-muted">{m.designation}</td>
                    <td>{m.phone || '—'}</td>
                    <td>
                      <Badge bg={m.isActive ? 'success' : 'secondary'}>
                        {m.isActive ? 'Active' : 'Hidden'}
                      </Badge>
                    </td>
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        <Button size="sm" variant="soft-primary" onClick={() => openEdit(m)}>
                          <IconifyIcon icon="ri:edit-line" />
                        </Button>
                        <Button size="sm" variant="soft-danger" onClick={() => handleDelete(m._id)}>
                          <IconifyIcon icon="ri:delete-bin-line" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">Showing {paged.length} of {filtered.length}</small>
              <div className="d-flex gap-1">
                <Button size="sm" variant="outline-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button key={i} size="sm" variant={page === i + 1 ? 'primary' : 'outline-secondary'} onClick={() => setPage(i + 1)}>{i + 1}</Button>
                ))}
                <Button size="sm" variant="outline-secondary" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create / Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{editMember ? `Edit — ${editMember.name}` : 'Add Team Member'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              {/* Photo */}
              <Col xs={12} className="text-center">
                <UserAvatar
                  src={photoPreview || form.photo || undefined}
                  alt={form.name || 'Photo'}
                  size={80}
                  className="rounded-circle mb-2"
                />
                <div>
                  <Form.Label className="btn btn-sm btn-outline-primary mb-0" style={{ cursor: 'pointer' }}>
                    <IconifyIcon icon="ri:upload-2-line" className="me-1" />Upload Photo
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
                  </Form.Label>
                </div>
              </Col>

              <Col md={6}>
                <Form.Label>Full Name *</Form.Label>
                <Form.Control required value={form.name} onChange={e => set('name', e.target.value)} />
              </Col>
              <Col md={6}>
                <Form.Label>Designation *</Form.Label>
                <Form.Control required value={form.designation} onChange={e => set('designation', e.target.value)} />
              </Col>
              <Col md={6}>
                <Form.Label>Phone</Form.Label>
                <Form.Control value={form.phone} onChange={e => set('phone', e.target.value)} />
              </Col>
              <Col md={6}>
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" value={form.email} onChange={e => set('email', e.target.value)} />
              </Col>
              <Col md={6}>
                <Form.Label>Facebook URL</Form.Label>
                <Form.Control value={form.facebook} onChange={e => set('facebook', e.target.value)} placeholder="https://facebook.com/..." />
              </Col>
              <Col md={6}>
                <Form.Label>Twitter URL</Form.Label>
                <Form.Control value={form.twitter} onChange={e => set('twitter', e.target.value)} placeholder="https://twitter.com/..." />
              </Col>
              <Col md={6}>
                <Form.Label>Instagram URL</Form.Label>
                <Form.Control value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="https://instagram.com/..." />
              </Col>
              <Col md={6}>
                <Form.Label>LinkedIn URL</Form.Label>
                <Form.Control value={form.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="https://linkedin.com/..." />
              </Col>
              <Col xs={12}>
                <Form.Label>Bio</Form.Label>
                <Form.Control as="textarea" rows={3} value={form.bio} onChange={e => set('bio', e.target.value)} />
              </Col>
              <Col md={6}>
                <Form.Label>Display Order</Form.Label>
                <Form.Control type="number" min={0} value={form.order} onChange={e => set('order', parseInt(e.target.value) || 0)} />
              </Col>
              <Col md={6} className="d-flex align-items-end">
                <Form.Check
                  type="switch"
                  label="Show on website"
                  checked={form.isActive}
                  onChange={e => set('isActive', e.target.checked)}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : editMember ? 'Update' : 'Add Member'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}

export default TeamMembersTab
