import { useEffect, useState } from 'react'
import { Alert, Badge, Button, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { testimonialAPI, uploadAPI } from '@/services/api'
import UserAvatar from '@/components/UserAvatar'

const EMPTY = {
  clientName: '', designation: '', title: '', text: '',
  rating: 5, showAsSatisfiedClient: false, order: 0, isActive: true,
}

const Stars = ({ rating }: { rating: number }) => (
  <span>
    {[1,2,3,4,5].map(i => (
      <i key={i} className={`ri-star-${i <= rating ? 'fill' : 'line'}`} style={{ color: '#fd7e14', fontSize: 13 }} />
    ))}
  </span>
)

const TestimonialsTab = () => {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterSatisfied, setFilterSatisfied] = useState(false)
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState<any>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const res = await testimonialAPI.getAll({ active: 'false' })
      setItems(res.data.data || [])
    } catch { setItems([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const filtered = items.filter(t => {
    const matchSearch = t.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (t.designation || '').toLowerCase().includes(search.toLowerCase())
    const matchSatisfied = !filterSatisfied || t.showAsSatisfiedClient
    return matchSearch && matchSatisfied
  })
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const openCreate = () => { setEditItem(null); setForm(EMPTY); setPhotoFile(null); setPhotoPreview(null); setShowModal(true) }
  const openEdit = (t: any) => { setEditItem(t); setForm({ ...t }); setPhotoFile(null); setPhotoPreview(null); setShowModal(true) }

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
      let photo = form.photo || ''
      let photoPublicId = form.photoPublicId || ''

      // Only upload if a new file was selected
      if (photoFile) {
        try {
          const up = await uploadAPI.uploadSingle(photoFile)
          photo = up.data.data.url
          photoPublicId = up.data.data.filename || ''
        } catch (uploadErr: any) {
          setMsg({ type: 'danger', text: 'Photo upload failed. Saving without photo.' })
          // Continue saving without photo rather than blocking
        }
      }

      const payload = { ...form, photo, photoPublicId }
      // Remove file-related fields that shouldn't go to the API
      delete payload.createdAt
      delete payload.updatedAt
      delete payload.__v

      if (editItem) {
        await testimonialAPI.update(editItem._id, payload)
      } else {
        await testimonialAPI.create(payload)
      }
      setMsg({ type: 'success', text: editItem ? 'Updated' : 'Testimonial added' })
      setShowModal(false)
      fetchAll()
    } catch (err: any) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Save failed' })
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return
    await testimonialAPI.remove(id)
    fetchAll()
  }

  const set = (f: string, v: any) => setForm((p: any) => ({ ...p, [f]: v }))

  return (
    <>
      {msg && <Alert variant={msg.type} dismissible onClose={() => setMsg(null)} className="mb-3">{msg.text}</Alert>}

      <Row className="mb-3 align-items-center g-2">
        <Col xs="auto">
          <Form.Control
            size="sm" placeholder="Search by name..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{ width: 220 }}
          />
        </Col>
        <Col xs="auto">
          <Form.Check
            type="switch" label="Satisfied clients only"
            checked={filterSatisfied}
            onChange={e => { setFilterSatisfied(e.target.checked); setPage(1) }}
          />
        </Col>
        <Col className="text-end">
          <Button size="sm" variant="primary" onClick={openCreate}>
            <IconifyIcon icon="ri:add-line" className="me-1" />Add Testimonial
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
                  <th>Client</th>
                  <th>Title</th>
                  <th>Rating</th>
                  <th>Satisfied Client</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr><td colSpan={8} className="text-center text-muted py-4">No testimonials found</td></tr>
                ) : paged.map((t, i) => (
                  <tr key={t._id}>
                    <td>{(page - 1) * PER_PAGE + i + 1}</td>
                    <td>
                      <UserAvatar src={t.photo || undefined} alt={t.clientName} size={40} className="rounded-circle" />
                    </td>
                    <td>
                      <div className="fw-semibold">{t.clientName}</div>
                      {t.designation && <small className="text-muted">{t.designation}</small>}
                    </td>
                    <td className="text-muted small">{t.title || '—'}</td>
                    <td><Stars rating={t.rating} /></td>
                    <td>
                      {t.showAsSatisfiedClient
                        ? <Badge bg="success">Yes</Badge>
                        : <Badge bg="secondary">No</Badge>}
                    </td>
                    <td><Badge bg={t.isActive ? 'success' : 'secondary'}>{t.isActive ? 'Active' : 'Hidden'}</Badge></td>
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        <Button size="sm" variant="soft-primary" onClick={() => openEdit(t)}>
                          <IconifyIcon icon="ri:edit-line" />
                        </Button>
                        <Button size="sm" variant="soft-danger" onClick={() => handleDelete(t._id)}>
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

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{editItem ? `Edit — ${editItem.clientName}` : 'Add Testimonial'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              {/* Photo */}
              <Col xs={12} className="text-center">
                <UserAvatar
                  src={photoPreview || form.photo || undefined}
                  alt={form.clientName || 'Photo'}
                  size={72}
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
                <Form.Label>Client Name *</Form.Label>
                <Form.Control required value={form.clientName} onChange={e => set('clientName', e.target.value)} />
              </Col>
              <Col md={6}>
                <Form.Label>Designation</Form.Label>
                <Form.Control value={form.designation} onChange={e => set('designation', e.target.value)} placeholder="e.g. CEO, Construction Company" />
              </Col>
              <Col xs={12}>
                <Form.Label>Testimonial Title</Form.Label>
                <Form.Control value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Outstanding Quality & Professionalism" />
              </Col>
              <Col xs={12}>
                <Form.Label>Testimonial Text *</Form.Label>
                <Form.Control as="textarea" rows={4} required value={form.text} onChange={e => set('text', e.target.value)} />
              </Col>
              <Col md={4}>
                <Form.Label>Rating (1–5)</Form.Label>
                <Form.Select value={form.rating} onChange={e => set('rating', parseInt(e.target.value))}>
                  {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label>Display Order</Form.Label>
                <Form.Control type="number" min={0} value={form.order} onChange={e => set('order', parseInt(e.target.value) || 0)} />
              </Col>
              <Col md={4} className="d-flex flex-column justify-content-end gap-2">
                <Form.Check type="switch" label="Show on website" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
                <Form.Check
                  type="switch"
                  label="Show as Satisfied Client"
                  checked={form.showAsSatisfiedClient}
                  onChange={e => set('showAsSatisfiedClient', e.target.checked)}
                />
              </Col>
              {form.showAsSatisfiedClient && (
                <Col xs={12}>
                  <Alert variant="info" className="py-2 mb-0" style={{ fontSize: 13 }}>
                    <IconifyIcon icon="ri:information-line" className="me-1" />
                    This client's photo will appear in the "Satisfied Clients" group image on the website.
                  </Alert>
                </Col>
              )}
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : editItem ? 'Update' : 'Add Testimonial'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}

export default TestimonialsTab
