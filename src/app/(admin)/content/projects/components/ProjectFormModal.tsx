import { useState, useEffect } from 'react'
import { Alert, Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap'
import { projectAPI, userAPI, uploadAPI } from '@/services/api'
import type { Project } from '../page'

interface Props {
  show: boolean
  project: Project | null
  onHide: () => void
  onSaved: () => void
}

const EMPTY = {
  title: '', slug: '', shortDescription: '', description: '', category: 'construction',
  location: '', clientName: '', status: 'planned', priority: 'medium',
  startDate: '', endDate: '', expectedCompletionDate: '', progressPercent: 0,
  isPublishedToWebsite: false, isFeatured: false, tags: '',
  projectManagerId: '', assignedUsers: [] as string[],
  featuredImage: { url: '', publicId: '' },
}

const ProjectFormModal = ({ show, project, onHide, onSaved }: Props) => {
  const [form, setForm] = useState({ ...EMPTY })
  const [users, setUsers] = useState<{ _id: string; name: string; email: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    userAPI.getUsers({ limit: 200 }).then(r => {
      if (r.data.success) setUsers(r.data.data || r.data.users || [])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title || '',
        slug: project.slug || '',
        shortDescription: project.shortDescription || '',
        description: project.description || '',
        category: project.category || 'construction',
        location: project.location || '',
        clientName: project.clientName || '',
        status: project.status || 'planned',
        priority: project.priority || 'medium',
        startDate: project.startDate ? project.startDate.slice(0, 10) : '',
        endDate: project.endDate ? project.endDate.slice(0, 10) : '',
        expectedCompletionDate: project.expectedCompletionDate ? project.expectedCompletionDate.slice(0, 10) : '',
        progressPercent: project.progressPercent ?? 0,
        isPublishedToWebsite: project.isPublishedToWebsite || false,
        isFeatured: project.isFeatured || false,
        tags: project.tags?.join(', ') || '',
        projectManagerId: project.projectManagerId?._id || '',
        assignedUsers: project.assignedUsers?.map(u => u._id) || [],
        featuredImage: project.featuredImage
          ? { url: project.featuredImage.url, publicId: project.featuredImage.publicId ?? '' }
          : { url: '', publicId: '' },
      })
    } else {
      setForm({ ...EMPTY })
    }
    setError('')
  }, [project, show])

  const set = (field: string) => (e: React.ChangeEvent<any>) =>
    setForm(prev => ({ ...prev, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      const res = await uploadAPI.uploadSingle(file)
      if (res.data.success) {
        setForm(prev => ({ ...prev, featuredImage: { url: res.data.url, publicId: res.data.publicId ?? '' } }))
      }
    } catch { setError('Image upload failed') }
    finally { setUploading(false) }
  }

  const handleAssignedToggle = (userId: string) => {
    setForm(prev => ({
      ...prev,
      assignedUsers: prev.assignedUsers.includes(userId)
        ? prev.assignedUsers.filter(id => id !== userId)
        : [...prev.assignedUsers, userId],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.title.trim()) { setError('Title is required'); return }
    if (form.progressPercent < 0 || form.progressPercent > 100) { setError('Progress must be 0–100'); return }
    if (form.isPublishedToWebsite && form.status !== 'completed') {
      setError('Only completed projects can be published to website'); return
    }
    try {
      setSaving(true)
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        progressPercent: Number(form.progressPercent),
        projectManagerId: form.projectManagerId || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        expectedCompletionDate: form.expectedCompletionDate || undefined,
      }
      if (project) {
        await projectAPI.updateProject(project._id, payload)
      } else {
        await projectAPI.createProject(payload)
      }
      onSaved()
      onHide()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="xl" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{project ? 'Edit Project' : 'New Project'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
          <Row className="g-3">
            {/* Basic Info */}
            <Col xs={12}><h6 className="text-uppercase text-muted fw-semibold border-bottom pb-1" style={{ fontSize: '0.72rem' }}>Basic Information</h6></Col>
            <Col md={8}>
              <Form.Group>
                <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                <Form.Control value={form.title} onChange={set('title')} placeholder="Project title" required />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select value={form.category} onChange={set('category')}>
                  <option value="construction">Construction</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="real-estate">Real Estate</option>
                  <option value="industrial">Industrial</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Short Description</Form.Label>
                <Form.Control value={form.shortDescription} onChange={set('shortDescription')} placeholder="Brief summary (shown on website)" maxLength={500} />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Full Description</Form.Label>
                <Form.Control as="textarea" rows={4} value={form.description} onChange={set('description')} placeholder="Detailed project description..." />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Location</Form.Label>
                <Form.Control value={form.location} onChange={set('location')} placeholder="e.g. Abuja, FCT" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Client Name</Form.Label>
                <Form.Control value={form.clientName} onChange={set('clientName')} placeholder="Client / Contractor" />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Tags <small className="text-muted">(comma-separated)</small></Form.Label>
                <Form.Control value={form.tags} onChange={set('tags')} placeholder="road, bridge, federal" />
              </Form.Group>
            </Col>

            {/* Status & Progress */}
            <Col xs={12}><h6 className="text-uppercase text-muted fw-semibold border-bottom pb-1 mt-2" style={{ fontSize: '0.72rem' }}>Status & Progress</h6></Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select value={form.status} onChange={set('status')}>
                  <option value="planned">Planned</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Priority</Form.Label>
                <Form.Select value={form.priority} onChange={set('priority')}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Progress % (0–100)</Form.Label>
                <Form.Control type="number" min={0} max={100} value={form.progressPercent} onChange={set('progressPercent')} />
              </Form.Group>
            </Col>

            {/* Timeline */}
            <Col xs={12}><h6 className="text-uppercase text-muted fw-semibold border-bottom pb-1 mt-2" style={{ fontSize: '0.72rem' }}>Timeline</h6></Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control type="date" value={form.startDate} onChange={set('startDate')} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Expected Completion</Form.Label>
                <Form.Control type="date" value={form.expectedCompletionDate} onChange={set('expectedCompletionDate')} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control type="date" value={form.endDate} onChange={set('endDate')} />
              </Form.Group>
            </Col>

            {/* Featured Image */}
            <Col xs={12}><h6 className="text-uppercase text-muted fw-semibold border-bottom pb-1 mt-2" style={{ fontSize: '0.72rem' }}>Featured Image</h6></Col>
            <Col md={12}>
              <div className="d-flex align-items-center gap-3">
                {form.featuredImage?.url && (
                  <img src={form.featuredImage.url} alt="preview"
                    style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 4 }} />
                )}
                <div>
                  <Form.Control type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  {uploading && <small className="text-muted mt-1 d-block"><Spinner size="sm" className="me-1" />Uploading...</small>}
                </div>
              </div>
            </Col>

            {/* Assignment */}
            <Col xs={12}><h6 className="text-uppercase text-muted fw-semibold border-bottom pb-1 mt-2" style={{ fontSize: '0.72rem' }}>Assignment</h6></Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Project Manager</Form.Label>
                <Form.Select value={form.projectManagerId} onChange={set('projectManagerId')}>
                  <option value="">— None —</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Assigned Users <small className="text-muted">({form.assignedUsers.length} selected)</small></Form.Label>
                <div className="border rounded p-2" style={{ maxHeight: 140, overflowY: 'auto' }}>
                  {users.map(u => (
                    <Form.Check key={u._id} type="checkbox" id={`user-${u._id}`}
                      label={`${u.name} (${u.email})`}
                      checked={form.assignedUsers.includes(u._id)}
                      onChange={() => handleAssignedToggle(u._id)} />
                  ))}
                </div>
              </Form.Group>
            </Col>

            {/* Website Options */}
            <Col xs={12}><h6 className="text-uppercase text-muted fw-semibold border-bottom pb-1 mt-2" style={{ fontSize: '0.72rem' }}>Website Options</h6></Col>
            <Col md={6}>
              <Form.Check type="switch" id="isFeatured" label="Featured Project"
                checked={form.isFeatured} onChange={set('isFeatured')} />
            </Col>
            <Col md={6}>
              <Form.Check type="switch" id="isPublished" label="Publish to Website (completed only)"
                checked={form.isPublishedToWebsite} onChange={set('isPublishedToWebsite')}
                disabled={form.status !== 'completed'} />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={saving || uploading}>
            {saving ? <><Spinner size="sm" className="me-1" />Saving...</> : project ? 'Update Project' : 'Create Project'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default ProjectFormModal
