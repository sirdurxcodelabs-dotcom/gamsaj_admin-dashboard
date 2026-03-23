import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Badge, Button, Card, Form } from 'react-bootstrap'
import type { FilterState } from '../useCalendar'

interface Props {
  createNewEvent: () => void
  filters: FilterState
  updateFilters: (f: Partial<FilterState>) => void
  clearFilters: () => void
  totalCount: number
  filteredCount: number
}

const eventTypeExamples = [
  { color: '#dc3545', title: 'Urgent: Permit Renewal',   icon: 'mdi:alert-circle' },
  { color: '#fd7e14', title: 'High: Site Inspection',    icon: 'mdi:clipboard-check' },
  { color: '#ffc107', title: 'Material Delivery',        icon: 'mdi:truck-delivery' },
  { color: '#28a745', title: 'Project Completed',        icon: 'mdi:check-circle' },
  { color: '#007bff', title: 'Team Meeting',             icon: 'mdi:account-group' },
  { color: '#6f42c1', title: 'Legal Compliance',         icon: 'mdi:gavel' },
]

const colorGuide = [
  { color: '#dc3545', label: 'Red — Urgent/Critical' },
  { color: '#fd7e14', label: 'Orange — High Priority' },
  { color: '#ffc107', label: 'Yellow — Warning/Attention' },
  { color: '#28a745', label: 'Green — Completed/Success' },
  { color: '#007bff', label: 'Blue — Info/Meetings' },
  { color: '#6f42c1', label: 'Purple — Legal/Compliance' },
]

const SidePanel = ({ createNewEvent, filters, updateFilters, clearFilters, totalCount, filteredCount }: Props) => {
  const hasActiveFilters = filters.type !== '' || filters.priority !== ''

  return (
    <>
      {/* Create Button */}
      <div className="d-grid mb-3">
        <Button variant="primary" size="lg" className="fs-16 d-flex align-items-center justify-content-center gap-2 py-3" onClick={createNewEvent}>
          <IconifyIcon icon="mdi:plus-circle" className="fs-20" />
          Create New Event
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-3">
        <Card.Body>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h6 className="card-title mb-0 d-flex align-items-center gap-2">
              <IconifyIcon icon="mdi:filter-outline" className="text-primary" />
              Filter Events
            </h6>
            {hasActiveFilters && (
              <Button variant="link" size="sm" className="p-0 text-danger" onClick={clearFilters}>
                <IconifyIcon icon="mdi:close-circle" className="me-1" />Clear
              </Button>
            )}
          </div>

          <Form.Group className="mb-2">
            <Form.Label className="small fw-semibold text-muted mb-1">Event Type</Form.Label>
            <Form.Select size="sm" value={filters.type} onChange={e => updateFilters({ type: e.target.value })}>
              <option value="">All Types</option>
              <option value="project">Construction Project</option>
              <option value="meeting">Meeting</option>
              <option value="deadline">Deadline</option>
              <option value="inspection">Site Inspection</option>
              <option value="delivery">Material Delivery</option>
              <option value="legal">Legal/Compliance</option>
              <option value="permit">Permit/License</option>
              <option value="maintenance">Maintenance</option>
              <option value="other">Other</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label className="small fw-semibold text-muted mb-1">Priority</Form.Label>
            <Form.Select size="sm" value={filters.priority} onChange={e => updateFilters({ priority: e.target.value })}>
              <option value="">All Priorities</option>
              <option value="urgent">🔴 Urgent</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </Form.Select>
          </Form.Group>

          {hasActiveFilters && (
            <div className="mt-2">
              <small className="text-muted">
                Showing <Badge bg="primary">{filteredCount}</Badge> of {totalCount} events
              </small>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Quick Add / Drag */}
      <Card className="border-0 shadow-sm mb-3">
        <Card.Body>
          <h6 className="card-title mb-2 d-flex align-items-center gap-2">
            <IconifyIcon icon="mdi:drag" className="text-primary" />
            Quick Add Events
          </h6>
          <p className="text-muted small mb-3">Drag onto the calendar or click a date to create.</p>
          <div id="external-events">
            {eventTypeExamples.map(({ color, title, icon }, i) => (
              <div
                key={i}
                className="external-event mb-2 p-2 rounded d-flex align-items-center gap-2"
                data-event={JSON.stringify({ title, color })}
                style={{ backgroundColor: color, color: '#fff', cursor: 'move', fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.2s ease' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <IconifyIcon icon={icon} />
                {title}
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* How It Works */}
      <Card className="border-0 shadow-sm mb-3 d-none d-xl-block">
        <Card.Body>
          <h6 className="card-title mb-3 d-flex align-items-center gap-2">
            <IconifyIcon icon="mdi:information" className="text-info" />
            How It Works
          </h6>
          <ul className="ps-3 mb-0 small text-muted">
            <li className="mb-2"><strong>Construction Projects:</strong> Track multi-day construction activities, site inspections, and project milestones for GAMSAJ's building projects.</li>
            <li className="mb-2"><strong>Legal & Compliance:</strong> Manage permit renewals, license applications, and compliance deadlines to ensure all projects meet regulatory requirements.</li>
            <li className="mb-2"><strong>Material Management:</strong> Schedule material deliveries, equipment arrivals, and coordinate with suppliers for timely project execution.</li>
            <li className="mb-0"><strong>Team Coordination:</strong> Organize meetings, site visits, and team activities to maintain smooth project operations.</li>
          </ul>
        </Card.Body>
      </Card>

      {/* Color Guide */}
      <Card className="border-0 shadow-sm bg-light mb-3 d-none d-xl-block">
        <Card.Body>
          <h6 className="card-title mb-3 d-flex align-items-center gap-2">
            <IconifyIcon icon="mdi:palette" className="text-success" />
            Color Guide
          </h6>
          {colorGuide.map(({ color, label }) => (
            <div key={color} className="d-flex align-items-center mb-2">
              <div style={{ width: 18, height: 18, backgroundColor: color, borderRadius: 3, flexShrink: 0 }} className="me-2" />
              <small className="text-muted">{label}</small>
            </div>
          ))}
        </Card.Body>
      </Card>

      {/* Quick Tips */}
      <Card className="border-0 shadow-sm bg-primary text-white d-none d-xl-block">
        <Card.Body>
          <h6 className="card-title mb-2 d-flex align-items-center gap-2">
            <IconifyIcon icon="mdi:lightbulb" />
            Quick Tips
          </h6>
          <ul className="ps-3 mb-0 small">
            <li className="mb-2">Click any date to create a new event</li>
            <li className="mb-2">Drag events to reschedule them</li>
            <li className="mb-2">Click events to view or edit details</li>
            <li className="mb-0">Use filters above to view specific event types</li>
          </ul>
        </Card.Body>
      </Card>
    </>
  )
}

export default SidePanel
