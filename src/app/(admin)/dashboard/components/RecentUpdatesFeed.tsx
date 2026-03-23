import { Card, CardBody, Badge, Spinner } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import type { DashboardUpdate } from '../types'

const TYPE_COLORS: Record<string, string> = {
  'progress-update': 'primary',
  milestone: 'success',
  issue: 'danger',
  note: 'secondary',
}

const TYPE_ICONS: Record<string, string> = {
  'progress-update': 'ri:bar-chart-line',
  milestone: 'ri:flag-line',
  issue: 'ri:error-warning-line',
  note: 'ri:sticky-note-line',
}

interface Props {
  updates: DashboardUpdate[]
  loading: boolean
  title?: string
}

const RecentUpdatesFeed = ({ updates, loading, title = 'Recent Project Updates' }: Props) => (
  <Card className="h-100">
    <CardBody>
      <h6 className="fw-semibold mb-3 d-flex align-items-center gap-2">
        <IconifyIcon icon="ri:history-line" className="text-primary" />
        {title}
      </h6>
      {loading ? (
        <div className="text-center py-4"><Spinner size="sm" /></div>
      ) : updates.length === 0 ? (
        <div className="text-center py-4 text-muted">
          <IconifyIcon icon="ri:inbox-line" style={{ fontSize: 32 }} />
          <p className="mt-2 mb-0 small">No updates yet</p>
        </div>
      ) : (
        <div style={{ maxHeight: 380, overflowY: 'auto' }}>
          {updates.map(u => (
            <div key={u._id} className="d-flex gap-3 mb-3 pb-3 border-bottom">
              <div className={`avatar-xs flex-shrink-0 mt-1`}>
                <div className={`avatar-title bg-${TYPE_COLORS[u.type] || 'secondary'}-subtle text-${TYPE_COLORS[u.type] || 'secondary'} rounded-circle fs-14`}>
                  <IconifyIcon icon={TYPE_ICONS[u.type] || 'ri:file-line'} />
                </div>
              </div>
              <div className="flex-grow-1 overflow-hidden">
                <div className="d-flex justify-content-between align-items-start">
                  <span className="fw-semibold small text-truncate" style={{ maxWidth: 180 }}>{u.title}</span>
                  <Badge bg={TYPE_COLORS[u.type] || 'secondary'} className="ms-1 text-capitalize flex-shrink-0" style={{ fontSize: '0.6rem' }}>
                    {u.type.replace('-', ' ')}
                  </Badge>
                </div>
                <small className="text-primary d-block text-truncate">{u.projectTitle}</small>
                {u.description && <small className="text-muted d-block text-truncate">{u.description}</small>}
                {u.images?.length > 0 && (
                  <div className="d-flex gap-1 mt-1">
                    {u.images.slice(0, 3).map((img, i) => (
                      <img key={i} src={img.url} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 3 }} />
                    ))}
                    {u.images.length > 3 && <small className="text-muted align-self-center">+{u.images.length - 3}</small>}
                  </div>
                )}
                <small className="text-muted">
                  {u.createdBy?.name && <><IconifyIcon icon="ri:user-line" className="me-1" />{u.createdBy.name} · </>}
                  {new Date(u.createdAt).toLocaleDateString()}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardBody>
  </Card>
)

export default RecentUpdatesFeed
