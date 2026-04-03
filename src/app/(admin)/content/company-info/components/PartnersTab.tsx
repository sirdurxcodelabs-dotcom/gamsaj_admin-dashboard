import { useEffect, useState } from 'react'
import { Alert, Badge, Button, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { partnerAPI, uploadAPI } from '@/services/api'

const EMPTY = { name: '', website: '', contactName: '', contactEmail: '', contactPhone: '', order: 0, isActive: true }

const PartnersTab = () => {
  const [partners, setPartners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  const [showModal, setShowModal] = useState(false)
  const [editPartner, setEditPartner] = useState<any>(null)
  const [form, setForm] = useState<any>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const res = await partnerAPI.getAll({ active: 'false' })
      setPartners(res.data.data || [])
    } catch { setPartners([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const filtered = partners.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.contactName || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.contactEmail || '').toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const openCreate = () => { setEditPartner(null); setForm(EMPTY); setLogoFile(null); setLogoPreview(null); setShowModal(true) }
  const openEdit = (p: any) => { setEditPartner(p); setForm({ ...p }); setLogoFile(null); setLogoPreview(null); setShowModal(true) }

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = ev => setLogoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      let logo = form.logo || ''
      let logoPublicId = form.logoPublicId || ''
      if (logoFile) {
        const up = await uploadAPI.uploadSingle(logoFile)
        logo = up.data.data.url
        logoPublicId = up.data.data.filename || ''
      }
      const payload = { ...form, logo, logoPublicId }
      if (editPartner) {
        await partnerAPI.update(editPartner._id, payload)
      } else {
        await partnerAPI.create(payload)
      }
      setMsg({ type: 'success', text: editPartner ? 'Partner updated' : 'Partner added' })
      setShowModal(false)
      fetchAll()
    } catch (err: any) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Save failed' })
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this partner?')) return
    await partnerAPI.remove(id)
    fetchAll()
  }

  const set = (f: string, v: any) => setForm((p: any) => ({ ...p, [f]: v }))

  return (
    <>
      {msg && <Alert variant={msg.type} dismissible onClose={() => setMsg(null)} className="mb-3">{msg.text}</Alert>}

      <Row className="mb-3 align-items-center">
        <Col>
          <Form.Control
            size="sm" placeholder="Search by name, contact..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{ maxWidth: 300 }}
          />
        </Col>
        <Col xs="auto">
          <Button size="sm" variant="primary" onClick={openCreate}>
            <IconifyIcon icon="ri:add-line" className="me-1" />Add Partner
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
                  <th>Logo</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Website</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-muted py-4">No partners found</td></tr>
                ) : paged.map((p, i) => (
                  <tr key={p._id}>
                    <td>{(page - 1) * PER_PAGE + i + 1}</td>
                    <td>
                      {p.logo
                        ? <img src={p.logo} alt={p.name} style={{ height: 36, maxWidth: 80, objectFit: 'contain' }} />
                        : <span className="text-muted small">No logo</span>}
                    </td>
                    <td className="fw-semibold">{p.name}</td>
                    <td>
                      {p.contactName && <div className="small">{p.contactName}</div>}
                      {p.contactEmail && <div className="small text-muted">{p.contactEmail}</div>}
                      {p.contactPhone && <div className="small text-muted">{p.contactPhone}</div>}
                    </td>
                    <td>
                      {p.website
                        ? <a href={p.website} target="_blank" rel="noopener noreferrer" className="small text-primary">{p.website}</a>
                        : '—'}
                    </td>
                    <td><Badge bg={p.isActive ? 'success' : 'secondary'}>{p.isActive ? 'Active' : 'Hidden'}</Badge></td>
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        <Button size="sm" variant="soft-primary" onClick={() => openEdit(p)}>
                          <IconifyIcon icon="ri:edit-line" />
                        </Button>
                        <Button size="sm" variant="soft-danger" onClick={() => handleDelete(p._id)}>
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
          <Modal.Title>{editPartner ? `Edit — ${editPartner.name}` : 'Add Partner'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              {/* Logo */}
              <Col xs={12} className="text-center">
                {(logoPreview || form.logo) && (
                  <img src={logoPreview || form.logo} alt="logo" style={{ maxHeight: 60, maxWidth: 200, objectFit: 'contain', marginBottom: 8 }} />
                )}
                <div>
                  <Form.Label className="btn btn-sm btn-outline-primary mb-0" style={{ cursor: 'pointer' }}>
                    <IconifyIcon icon="ri:upload-2-line" className="me-1" />Upload Logo
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogo} />
                  </Form.Label>
                </div>
              </Col>

              <Col md={6}>
                <Form.Label>Partner Name *</Form.Label>
                <Form.Control required value={form.name} onChange={e => set('name', e.target.value)} />
              </Col>
              <Col md={6}>
                <Form.Label>Website URL</Form.Label>
                <Form.Control type="url" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://..." />
              </Col>
              <Col xs={12}><hr className="my-1" /><small className="text-muted fw-semibold">Contact Details</small></Col>
              <Col md={4}>
                <Form.Label>Contact Name</Form.Label>
                <Form.Control value={form.contactName} onChange={e => set('contactName', e.target.value)} />
              </Col>
              <Col md={4}>
                <Form.Label>Contact Email</Form.Label>
                <Form.Control type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} />
              </Col>
              <Col md={4}>
                <Form.Label>Contact Phone</Form.Label>
                <Form.Control value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} />
              </Col>
              <Col md={6}>
                <Form.Label>Display Order</Form.Label>
                <Form.Control type="number" min={0} value={form.order} onChange={e => set('order', parseInt(e.target.value) || 0)} />
              </Col>
              <Col md={6} className="d-flex align-items-end">
                <Form.Check type="switch" label="Show on website" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : editPartner ? 'Update' : 'Add Partner'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}

export default PartnersTab
