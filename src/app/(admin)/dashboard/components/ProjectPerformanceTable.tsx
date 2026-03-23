import { Badge, Card, CardBody, Spinner } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import type { ProjectPerformance } from '../types'

const STATUS_COLORS: Record<string, string> = {
  planned: 'secondary', ongoing: 'primary', 'on-hold': 'warning', completed: 'success', cancelled: 'danger',
}

const HEALTH_CONFIG = {
  healthy: { color: 'success', icon: 'ri:heart-pulse-line', label: 'Healthy' },
  'at-risk': { color: 'danger', icon: 'ri:alarm-warning-line', label: 'At Risk' },
  'no-update': { color: 'warning', icon: 'ri:time-line', label: 'No Update' },
}

interface Props {
  projects: ProjectPerformance[]
  loading: boolean
  title?: string
}

const ProjectPerformanceTable = ({ projects, loading, title = 'Project Performance' }: Props) => (
  <Card>
    <CardBody>
      <h6 className="fw-semibold mb-3 d-flex align-items-center gap-2">
        <IconifyIcon icon="ri:bar-chart-grouped-line" className="text-primary" />
        {title}
      </h6>
      {loading ? (
        <div className="text-center py-4"><Spinner size="sm" /></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-4 text-muted">
          <IconifyIcon icon="ri:folder-open-line" style={{ fontSize: 32 }} />
          <p className="mt-2 mb-0 small">No assigned projects yet</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.82rem' }}>
            <thead className="table-light">
              <tr>
                <th>Project</th>
                <th>Status</th>
                <th style={{ minWidth: 100 }}>Progress</th>
                <th>Health</th>
                <th>Last Update</th>
                <th>Updates</th>
                <th>Team</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => {
                const health = HEALTH_CONFIG[p.health] || HEALTH_CONFIG.healthy
                return (
                  <tr key={p._id}>
                    <td>
                      <div className="fw-semibold text-truncate" style={{ maxWidth: 180 }}>{p.title}</div>
                      {p.location && <small className="text-muted">{p.location}</small>}
                    </td>
                    <td>
                      <Badge bg={STATUS_COLORS[p.status] || 'secondary'} className="text-capitalize">
                        {p.status.replace('-', ' ')}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" style={{ height: 5, minWidth: 60 }}>
                          <div className={`progress-bar bg-${STATUS_COLORS[p.status] || 'primary'}`}
                            style={{ width: `${p.progressPercent}%` }} />
                        </div>
                        <small>{p.progressPercent}%</small>
                      </div>
                    </td>
                    <td>
                      <span className={`text-${health.color} d-flex align-items-center gap-1`} style={{ fontSize: '0.78rem' }}>
                        <IconifyIcon icon={health.icon} />
                        {health.label}
                      </span>
                    </td>
                    <td>
                      <small className="text-muted">
                        {p.lastUpdateDate
                          ? p.daysSinceUpdate === 0 ? 'Today'
                            : p.daysSinceUpdate === 1 ? 'Yesterday'
                              : `${p.daysSinceUpdate}d ago`
                          : '—'}
                      </small>
                    </td>
                    <td><small>{p.updatesCount}</small></td>
                    <td><small>{p.teamCount} users</small></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </CardBody>
  </Card>
)

export default ProjectPerformanceTable
