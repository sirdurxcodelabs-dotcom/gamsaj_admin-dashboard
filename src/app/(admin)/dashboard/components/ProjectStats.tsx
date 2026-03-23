import { useEffect, useState } from 'react'
import { Card, CardBody, Col, Row, Spinner } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { projectAPI } from '@/services/api'

interface Counts {
  ongoing: number
  planned: number
  completed: number
  onHold: number
  total: number
}

const StatBox = ({
  label, value, icon, color, loading,
}: { label: string; value: number; icon: string; color: string; loading: boolean }) => (
  <Card className={`border-start border-4 border-${color} h-100`}>
    <CardBody className="d-flex align-items-center gap-3">
      <div className={`avatar-sm flex-shrink-0`}>
        <div className={`avatar-title bg-${color}-subtle text-${color} fs-22 rounded`}>
          <IconifyIcon icon={icon} />
        </div>
      </div>
      <div>
        <p className="text-muted fw-semibold mb-1" style={{ fontSize: '0.8rem' }}>{label}</p>
        {loading ? <Spinner size="sm" /> : <h4 className="mb-0">{value}</h4>}
      </div>
    </CardBody>
  </Card>
)

const ProjectStats = () => {
  const [counts, setCounts] = useState<Counts>({ ongoing: 0, planned: 0, completed: 0, onHold: 0, total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ongoing, planned, completed, onHold, all] = await Promise.all([
          projectAPI.getProjects({ status: 'ongoing', limit: 1 }),
          projectAPI.getProjects({ status: 'planned', limit: 1 }),
          projectAPI.getProjects({ status: 'completed', limit: 1 }),
          projectAPI.getProjects({ status: 'on-hold', limit: 1 }),
          projectAPI.getProjects({ limit: 1 }),
        ])
        setCounts({
          ongoing: ongoing.data.pagination?.total ?? 0,
          planned: planned.data.pagination?.total ?? 0,
          completed: completed.data.pagination?.total ?? 0,
          onHold: onHold.data.pagination?.total ?? 0,
          total: all.data.pagination?.total ?? 0,
        })
      } catch { /* silently fail */ }
      finally { setLoading(false) }
    }
    fetchAll()
  }, [])

  return (
    <Row className="g-3 mb-3">
      <Col xs={6} xl={3}>
        <StatBox label="Ongoing Projects" value={counts.ongoing} icon="ri:loader-4-line" color="primary" loading={loading} />
      </Col>
      <Col xs={6} xl={3}>
        <StatBox label="Planned Projects" value={counts.planned} icon="ri:calendar-schedule-line" color="info" loading={loading} />
      </Col>
      <Col xs={6} xl={3}>
        <StatBox label="Completed Projects" value={counts.completed} icon="ri:checkbox-circle-line" color="success" loading={loading} />
      </Col>
      <Col xs={6} xl={3}>
        <StatBox label="On Hold" value={counts.onHold} icon="ri:pause-circle-line" color="warning" loading={loading} />
      </Col>
    </Row>
  )
}

export default ProjectStats
