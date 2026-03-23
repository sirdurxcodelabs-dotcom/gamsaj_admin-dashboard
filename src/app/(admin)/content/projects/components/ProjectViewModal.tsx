import { useState, useEffect, useRef } from 'react'
import { Alert, Badge, Button, Form, Modal, Spinner } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { projectAPI, uploadAPI } from '@/services/api'
import type { Project } from '../page'

interface UpdateImage { url: string; publicId?: string }
interface Update {
  _id: string; title: string; description: string; type: string
  images?: UpdateImage[]
  createdBy: { name: string; avatar?: string }; createdAt: string
}

interface Props {
  show: boolean
  project: Project | null
  onHide: () => void
  onEdit: () => void
  onRefresh: () => void
}

const STATUS_COLORS: Record<string, string> = {
  planned: 'secondary', ongoing: 'primary', 'on-hold': 'warning', completed: 'success', cancelled: 'danger',
}
const TYPE_COLORS: Record<string, string> = {
  'progress-update': 'primary', issue: 'danger', milestone: 'success', note: 'secondary',
}

const ProjectViewModal = ({ show, project, onHide, onEdit, onRefresh }: Props) => {
  const [updates, setUpdates] = useState<Update[]>([])
  const [loadingUpdates, setLoadingUpdates] = useState(false)
  const [newUpdate, setNewUpdate] = useState({ title: '', description: '', type: 'progress-update' })
  const [updateImages, setUpdateImages] = useState<File[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [addingUpdate, setAddingUpdate] = useState(false)
  const [updateError, setUpdateError] = useState('')
  const [statusForm, setStatusForm] = useState({ status: '', progressPercent: 0 })
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (show && project) {
      fetchUpdates()
      setStatusForm({ status: project.status, progressPercent: project.progressPercent })
    }
  }, [show, project])

  const fetchUpdates = async () => {
    if (!project) return
    try {
      setLoadingUpdates(true)
      const res = await projectAPI.getUpdates(project._id)
      if (res.data.success) setUpdates(res.data.data)
    } catch { setUpdates([]) }
    finally { setLoadingUpdates(false) }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remaining = 5 - updateImages.length
    setUpdateImages(prev => [...prev, ...files.slice(0, remaining)])
    e.target.value = ''
  }

  const removeImage = (idx: number) => setUpdateImages(prev => prev.filter((_, i) => i !== idx))

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUpdate.title.trim() || !project) return
    try {
      setAddingUpdate(true)
      setUpdateError('')

      // Upload images first if any
      let uploadedImages: UpdateImage[] = []
      if (updateImages.length > 0) {
        setUploadingImages(true)
        const res = await uploadAPI.uploadMultiple(updateImages)
        uploadedImages = (res.data.data || []).map((f: any) => ({ url: f.url, publicId: f.filename || '' }))
        setUploadingImages(false)
      }

      await projectAPI.addUpdate(project._id, { ...newUpdate, images: uploadedImages })
      setNewUpdate({ title: '', description: '', type: 'progress-update' })
      setUpdateImages([])
      fetchUpdates()
      onRefresh()
    } catch (err: any) {
      setUploadingImages(false)
      setUpdateError(err.response?.data?.message || 'Failed to add update')
    } finally { setAddingUpdate(false) }
  }

  const handleDeleteUpdate = async (updateId: string) => {
    if (!project || !confirm('Delete this update?')) return
    try {
      await projectAPI.deleteUpdate(project._id, updateId)
      fetchUpdates()
    } catch { }
  }

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project) return
    try {
      setUpdatingStatus(true)
      await projectAPI.updateStatus(project._id, {
        status: statusForm.status as any,
        progressPercent: Number(statusForm.progressPercent),
      })
      onRefresh()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed')
    } finally { setUpdatingStatus(false) }
  }

  if (!project) return null

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          {project.title}
          <Badge bg={STATUS_COLORS[project.status] || 'secondary'} className="text-capitalize">
            {project.status?.replace('-', ' ')}
          </Badge>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row g-4">
          {/* Left: Project Info */}
          <div className="col-lg-7">
            {project.featuredImage?.url && (
              <img src={project.featuredImage.url} alt={project.title}
                className="w-100 mb-3" style={{ maxHeight: 260, objectFit: 'cover', borderRadius: 8 }} />
            )}

            <div className="row g-2 mb-3">
              {[
                ['Category', project.category?.replace('-', ' ')],
                ['Location', project.location],
                ['Client', project.clientName],
                ['Priority', project.priority],
                ['Start', project.startDate ? new Date(project.startDate).toLocaleDateString() : '—'],
                ['End', project.endDate ? new Date(project.endDate).toLocaleDateString() : '—'],
              ].map(([label, val]) => val ? (
                <div key={label} className="col-6">
                  <small className="text-muted d-block">{label}</small>
                  <span className="text-capitalize">{val}</span>
                </div>
              ) : null)}
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <small className="fw-semibold">Progress</small>
                <small>{project.progressPercent}%</small>
              </div>
              <div className="progress" style={{ height: 8 }}>
                <div className="progress-bar" style={{ width: `${project.progressPercent}%` }} />
              </div>
            </div>

            {project.shortDescription && <p className="text-muted small">{project.shortDescription}</p>}
            {project.description && <p style={{ whiteSpace: 'pre-wrap' }}>{project.description}</p>}

            {project.assignedUsers?.length > 0 && (
              <div className="mb-3">
                <small className="text-muted fw-semibold d-block mb-1">Assigned Team</small>
                <div className="d-flex flex-wrap gap-1">
                  {project.assignedUsers.map(u => (
                    <span key={u._id} className="badge bg-light text-dark border">{u.name}</span>
                  ))}
                </div>
              </div>
            )}
            {project.projectManagerId && (
              <div className="mb-3">
                <small className="text-muted fw-semibold d-block mb-1">Project Manager</small>
                <span className="badge bg-primary">{project.projectManagerId.name}</span>
              </div>
            )}

            {/* Quick Status Update */}
            <div className="border rounded p-3 bg-light">
              <small className="text-uppercase fw-semibold text-muted d-block mb-2">Update Status</small>
              <Form onSubmit={handleStatusUpdate}>
                <div className="d-flex gap-2 align-items-end">
                  <Form.Select size="sm" value={statusForm.status}
                    onChange={e => setStatusForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="planned">Planned</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                  <Form.Control size="sm" type="number" min={0} max={100} style={{ width: 80 }}
                    value={statusForm.progressPercent}
                    onChange={e => setStatusForm(p => ({ ...p, progressPercent: Number(e.target.value) }))} />
                  <Button size="sm" type="submit" variant="primary" disabled={updatingStatus}>
                    {updatingStatus ? <Spinner size="sm" /> : 'Save'}
                  </Button>
                </div>
              </Form>
            </div>
          </div>

          {/* Right: Updates / Activity Log */}
          <div className="col-lg-5">
            <h6 className="fw-semibold mb-3">Activity Log</h6>

            {/* Add Update Form */}
            <Form onSubmit={handleAddUpdate} className="mb-3 border rounded p-3 bg-light">
              {updateError && <Alert variant="danger" className="py-1 small">{updateError}</Alert>}
              <Form.Select size="sm" className="mb-2" value={newUpdate.type}
                onChange={e => setNewUpdate(p => ({ ...p, type: e.target.value }))}>
                <option value="progress-update">Progress Update</option>
                <option value="milestone">Milestone</option>
                <option value="issue">Issue</option>
                <option value="note">Note</option>
              </Form.Select>
              <Form.Control size="sm" className="mb-2" placeholder="Update title *"
                value={newUpdate.title} onChange={e => setNewUpdate(p => ({ ...p, title: e.target.value }))} />
              <Form.Control as="textarea" size="sm" rows={2} className="mb-2" placeholder="Details (optional)"
                value={newUpdate.description} onChange={e => setNewUpdate(p => ({ ...p, description: e.target.value }))} />

              {/* Image upload */}
              <div className="mb-2">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <small className="text-muted">Images ({updateImages.length}/5)</small>
                  {updateImages.length < 5 && (
                    <Button size="sm" variant="outline-secondary" type="button"
                      onClick={() => fileInputRef.current?.click()} style={{ fontSize: '0.7rem', padding: '1px 6px' }}>
                      <IconifyIcon icon="ri:image-add-line" className="me-1" />Add
                    </Button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleImageSelect} />
                </div>
                {updateImages.length > 0 && (
                  <div className="d-flex flex-wrap gap-1">
                    {updateImages.map((f, i) => (
                      <div key={i} className="position-relative" style={{ width: 52, height: 52 }}>
                        <img src={URL.createObjectURL(f)} alt=""
                          style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 4, border: '1px solid #dee2e6' }} />
                        <button type="button" onClick={() => removeImage(i)}
                          style={{ position: 'absolute', top: -4, right: -4, background: '#dc3545', border: 'none', borderRadius: '50%', width: 16, height: 16, color: '#fff', fontSize: 10, lineHeight: '16px', padding: 0, cursor: 'pointer' }}>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button size="sm" type="submit" variant="primary"
                disabled={addingUpdate || uploadingImages || !newUpdate.title.trim()}>
                {uploadingImages ? <><Spinner size="sm" className="me-1" />Uploading...</> :
                  addingUpdate ? <Spinner size="sm" /> : 'Add Update'}
              </Button>
            </Form>

            {/* Updates List */}
            {loadingUpdates ? (
              <div className="text-center py-3"><Spinner size="sm" /></div>
            ) : updates.length === 0 ? (
              <p className="text-muted small text-center">No updates yet.</p>
            ) : (
              <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                {updates.map(u => (
                  <div key={u._id} className="border rounded p-2 mb-2">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <Badge bg={TYPE_COLORS[u.type] || 'secondary'} className="me-1 text-capitalize" style={{ fontSize: '0.65rem' }}>
                          {u.type.replace('-', ' ')}
                        </Badge>
                        <span className="fw-semibold small">{u.title}</span>
                      </div>
                      <Button size="sm" variant="link" className="text-danger p-0"
                        onClick={() => handleDeleteUpdate(u._id)}>
                        <IconifyIcon icon="ri:delete-bin-line" />
                      </Button>
                    </div>
                    {u.description && <p className="small text-muted mb-1 mt-1">{u.description}</p>}
                    {u.images && u.images.length > 0 && (
                      <div className="d-flex flex-wrap gap-1 mt-1">
                        {u.images.map((img, i) => (
                          <a key={i} href={img.url} target="_blank" rel="noreferrer">
                            <img src={img.url} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} />
                          </a>
                        ))}
                      </div>
                    )}
                    <small className="text-muted">
                      {u.createdBy?.name} · {new Date(u.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button variant="primary" onClick={onEdit}>
          <IconifyIcon icon="ri:edit-line" className="me-1" />Edit Project
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ProjectViewModal
