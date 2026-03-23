import { Card, Col, Row } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

type ConnectionStatsProps = {
  stats: {
    totalContacts: number
    totalSubscribers: number
    newContacts: number
    readContacts: number
    respondedContacts: number
  }
}

const ConnectionStats = ({ stats }: ConnectionStatsProps) => {
  return (
    <Row className="mb-3">
      <Col md={6} xl={3}>
        <Card className="border-start border-primary border-3">
          <Card.Body>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className="avatar-sm">
                  <div className="avatar-title bg-soft-primary text-primary rounded-circle fs-20">
                    <IconifyIcon icon="mdi:email" />
                  </div>
                </div>
              </div>
              <div className="flex-grow-1">
                <h5 className="mb-1">{stats.totalContacts}</h5>
                <p className="text-muted mb-0">Total Contacts</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={6} xl={3}>
        <Card className="border-start border-success border-3">
          <Card.Body>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className="avatar-sm">
                  <div className="avatar-title bg-soft-success text-success rounded-circle fs-20">
                    <IconifyIcon icon="mdi:email-newsletter" />
                  </div>
                </div>
              </div>
              <div className="flex-grow-1">
                <h5 className="mb-1">{stats.totalSubscribers}</h5>
                <p className="text-muted mb-0">Subscribers</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={6} xl={3}>
        <Card className="border-start border-warning border-3">
          <Card.Body>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className="avatar-sm">
                  <div className="avatar-title bg-soft-warning text-warning rounded-circle fs-20">
                    <IconifyIcon icon="mdi:email-alert" />
                  </div>
                </div>
              </div>
              <div className="flex-grow-1">
                <h5 className="mb-1">{stats.newContacts}</h5>
                <p className="text-muted mb-0">New Contacts</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={6} xl={3}>
        <Card className="border-start border-info border-3">
          <Card.Body>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className="avatar-sm">
                  <div className="avatar-title bg-soft-info text-info rounded-circle fs-20">
                    <IconifyIcon icon="mdi:email-check" />
                  </div>
                </div>
              </div>
              <div className="flex-grow-1">
                <h5 className="mb-1">{stats.respondedContacts}</h5>
                <p className="text-muted mb-0">Responded</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )
}

export default ConnectionStats
