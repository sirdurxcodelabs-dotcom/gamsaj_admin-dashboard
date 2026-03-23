import { useState, useEffect, useCallback } from 'react'
import { Badge, Button, InputGroup, Form, Spinner, Table } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { projectAPI } from '@/services/api'
import type { Project } from '../page'

const STATUS_COLORS: Record<string, string> = {
  planned: 'secondary', ongoing: 'primary', 'on-hold': 'warning',
  completed: 'success', cancelled: 'danger',
}
const PRIORITY_COLORS: Record<string, string> = { low: 'info', medium: 'warning', high: 'danger' }

interface Props {
  refreshKey: number
  onEdit: (p: Project) => void
  onView: (p: Project) => void
  onCreate: () => void
  onRefresh: () => void
}

const ProjectsTable = ({ refreshKey, onEdit, onView, onCreate, onRefresh }: Props) => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [seeding, setSeeding] = useState(false)

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      const res = await projectAPI.getProjects({
        page, limit: 15,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(categoryFilter && { category: categoryFilter }),
      })
      if (res.data.success) {
        setProjects(res.data.data)
        setTotalPages(res.data.pagination.pages)
        setTotal(res.data.pagination.total)
      }
    } catch { setProjects([]) }
    finally { setLoading(false) }
  }, [page, search, statusFilter, categoryFilter, refreshKey])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const handleSeedDemo = async () => {
    if (!confirm('This will replace all existing demo projects with 10 fresh ones. Continue?')) return
    try {
      setSeeding(true)
      const res = await projectAPI.seedDemo()
      alert(res.data.message || 'Demo projects seeded!')
      onRefresh()
    } catch (e: any) {
      alert(e.response?.data?.message || 'Seeding failed')
    } finally {
      setSeeding(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return
    try {
      await projectAPI.deleteProject(id)
      onRefresh()
    } catch (e: any) { alert(e.response?.data?.message || 'Delete failed') }
  }

  const handleTogglePublish = async (p: Project) => {
    try {
      await projectAPI.togglePublish(p._id)
      onRefresh()
    } catch (e: any) { alert(e.response?.data?.message || 'Failed') }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
        <div className="d-flex flex-wrap gap-2">
          <InputGroup style={{ width: 220 }}>
            <InputGroup.Text><IconifyIcon icon="ri:search-line" /></InputGroup.Text>
            <Form.Control placeholder="Search projects..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </InputGroup>
          <Form.Select style={{ width: 140 }} value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="">All Status</option>
            <option value="planned">Planned</option>
            <option value="ongoing">Ongoing</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Form.Select>
          <Form.Select style={{ width: 160 }} value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(1) }}>
            <option value="">All Categories</option>
            <option value="construction">Construction</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="real-estate">Real Estate</option>
            <option value="industrial">Industrial</option>
            <option value="other">Other</option>
          </Form.Select>
        </div>
        <Button variant="primary" size="sm" onClick={onCreate}>
          <IconifyIcon icon="ri:add-line" className="me-1" />New Project
        </Button>
        <Button variant="outline-secondary" size="sm" onClick={handleSeedDemo} disabled={seeding}>
          {seeding ? <><Spinner size="sm" className="me-1" />Seeding...</> : <><IconifyIcon icon="ri:database-2-line" className="me-1" />Seed Demo Data</>}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5"><Spinner variant="primary" /></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-5 text-muted">No projects found.</div>
      ) : (
        <div className="table-responsive">
          <Table hover className="mb-0 align-middle" style={{ fontSize: '0.875rem' }}>
            <thead className="table-light">
              <tr>
                <th style={{ width: 50 }}>#</th>
                <th>Project</th>
                <th>Category</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Progress</th>
                <th>Team</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p, i) => (
                <tr key={p._id}>
                  <td className="text-muted">{(page - 1) * 15 + i + 1}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {p.featuredImage?.url ? (
                        <img src={p.featuredImage.url} alt={p.title}
                          style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                      ) : (
                        <div className="bg-light d-flex align-items-center justify-content-center"
                          style={{ width: 40, height: 40, borderRadius: 4 }}>
                          <IconifyIcon icon="ri:building-line" className="text-muted" />
                        </div>
                      )}
                      <div>
                        <div className="fw-semibold">{p.title}</div>
                        {p.location && <small className="text-muted"><IconifyIcon icon="ri:map-pin-line" className="me-1" />{p.location}</small>}
                      </div>
                    </div>
                  </td>
                  <td><span className="text-capitalize">{p.category?.replace('-', ' ')}</span></td>
                  <td>
                    <Badge bg={STATUS_COLORS[p.status] || 'secondary'} className="text-capitalize">
                      {p.status?.replace('-', ' ')}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={PRIORITY_COLORS[p.priority] || 'secondary'} className="text-capitalize">
                      {p.priority}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="progress flex-grow-1" style={{ height: 6, minWidth: 60 }}>
                        <div className="progress-bar" style={{ width: `${p.progressPercent}%` }} />
                      </div>
                      <small>{p.progressPercent}%</small>
                    </div>
                  </td>
                  <td>
                    <small className="text-muted">{p.assignedUsers?.length || 0} users</small>
                  </td>
                  <td>
                    <div className="d-flex gap-1 flex-wrap">
                      <Button size="sm" variant="outline-info" onClick={() => onView(p)} title="View">
                        <IconifyIcon icon="ri:eye-line" />
                      </Button>
                      <Button size="sm" variant="outline-primary" onClick={() => onEdit(p)} title="Edit">
                        <IconifyIcon icon="ri:edit-line" />
                      </Button>
                      {p.status === 'completed' && (
                        <Button
                          size="sm"
                          variant={p.isPublishedToWebsite ? 'success' : 'outline-success'}
                          onClick={() => handleTogglePublish(p)}
                          title={p.isPublishedToWebsite ? 'Unpublish from website' : 'Publish to website'}
                        >
                          <IconifyIcon icon={p.isPublishedToWebsite ? 'ri:global-line' : 'ri:global-off-line'} />
                        </Button>
                      )}
                      <Button size="sm" variant="outline-danger" onClick={() => handleDelete(p._id)} title="Delete">
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
        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">Total: {total} projects</small>
          <div className="d-flex gap-1">
            <Button size="sm" variant="outline-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <IconifyIcon icon="ri:arrow-left-s-line" />
            </Button>
            <span className="px-2 py-1 small">Page {page} of {totalPages}</span>
            <Button size="sm" variant="outline-secondary" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              <IconifyIcon icon="ri:arrow-right-s-line" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectsTable
