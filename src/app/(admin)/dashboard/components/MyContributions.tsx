import { Badge, Card, CardBody, Spinner } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import type { DashboardData } from '../types'

const TYPE_COLORS: Record<string, string> = {
  'progress-update': 'primary', milestone: 'success', issue: 'danger', note: 'secondary',
}

interface Props {
  contributions: DashboardData['myContributions']
  loading: boolean
}

const MyContributions = ({ contributions, loading }: Props) => (
  <Card className="h-100">
    <CardBody>
      <h6 className="fw-semibold mb-3 d-flex align-items-center gap-2">
        <IconifyIcon icon="ri:user-star-line" className="text-success" />
        My Contributions
      </h6>
      {loading ? (
        <div className="text-center py-3"><Spinner size="sm" /></div>
      ) : contributions.length === 0 ? (
        <div className="text-center py-3 text-muted">
          <IconifyIcon icon="ri:edit-box-line" style={{ fontSize: 28 }} />
          <p className="mt-2 mb-0 small">No updates posted yet</p>
        </div>
      ) : (
        <div>
          {contributions.map(c => (
            <div key={c._id} className="d-flex align-items-start gap-2 mb-2 pb-2 border-bottom">
              <Badge bg={TYPE_COLORS[c.type] || 'secondary'} className="text-capitalize mt-1 flex-shrink-0" style={{ fontSize: '0.6rem' }}>
                {c.type.replace('-', ' ')}
              </Badge>
              <div className="overflow-hidden">
                <div className="small fw-semibold text-truncate">{c.title}</div>
                <small className="text-primary text-truncate d-block">{c.projectTitle}</small>
                <small className="text-muted">{new Date(c.createdAt).toLocaleDateString()}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardBody>
  </Card>
)

export default MyContributions
