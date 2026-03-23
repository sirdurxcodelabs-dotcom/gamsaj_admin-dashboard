import { Card, CardBody, Col, Row, Spinner } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import type { DashboardData } from '../types'

interface Props {
  counts: DashboardData['projectCounts']
  loading: boolean
  global: boolean
  orgStats: DashboardData['orgStats']
}

const Box = ({ label, value, icon, color, loading }: {
  label: string; value: number; icon: string; color: string; loading: boolean
}) => (
  <Card className={`border-start border-4 border-${color} h-100`}>
    <CardBody className="d-flex align-items-center gap-3">
      <div className="avatar-sm flex-shrink-0">
        <div className={`avatar-title bg-${color}-subtle text-${color} fs-22 rounded`}>
          <IconifyIcon icon={icon} />
        </div>
      </div>
      <div>
        <p className="text-muted fw-semibold mb-1" style={{ fontSize: '0.78rem' }}>{label}</p>
        {loading ? <Spinner size="sm" /> : <h4 className="mb-0">{value}</h4>}
      </div>
    </CardBody>
  </Card>
)

const StatCards = ({ counts, loading, global, orgStats }: Props) => (
  <Row className="g-3 mb-3">
    <Col xs={6} xl={global ? 2 : 3}>
      <Box label="Total Projects" value={counts.total} icon="ri:folder-line" color="dark" loading={loading} />
    </Col>
    <Col xs={6} xl={global ? 2 : 3}>
      <Box label="Ongoing" value={counts.ongoing} icon="ri:loader-4-line" color="primary" loading={loading} />
    </Col>
    <Col xs={6} xl={global ? 2 : 3}>
      <Box label="Planned" value={counts.planned} icon="ri:calendar-schedule-line" color="info" loading={loading} />
    </Col>
    <Col xs={6} xl={global ? 2 : 3}>
      <Box label="Completed" value={counts.completed} icon="ri:checkbox-circle-line" color="success" loading={loading} />
    </Col>
    <Col xs={6} xl={global ? 2 : 3}>
      <Box label="On Hold" value={counts.onHold} icon="ri:pause-circle-line" color="warning" loading={loading} />
    </Col>
    {global && orgStats && (
      <>
        <Col xs={6} xl={2}>
          <Box label="Active Users" value={orgStats.totalUsers} icon="ri:team-line" color="secondary" loading={loading} />
        </Col>
      </>
    )}
  </Row>
)

export default StatCards
