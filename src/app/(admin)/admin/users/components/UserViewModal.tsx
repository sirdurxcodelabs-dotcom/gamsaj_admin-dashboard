import { Modal, Button, Badge, Row, Col } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

interface User {
  _id: string; name: string; email: string
  role?: { _id: string; name: string; slug: string } | null
  isActive: boolean; isVerified: boolean; permissions?: string[]
  avatar?: string; phone?: string; location?: string; createdAt: string
}

interface Props { show: boolean; onHide: () => void; user: User | null; onEdit: (u: User) => void }

const UserViewModal = ({ show, onHide, user, onEdit }: Props) => {
  if (!user) return null

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>User Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center mb-4">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="rounded-circle" style={{ width: 72, height: 72, objectFit: 'cover' }} />
          ) : (
            <div className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center text-white fw-bold"
              style={{ width: 72, height: 72, fontSize: 28 }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h5 className="mt-2 mb-0">{user.name}</h5>
          <small className="text-muted">{user.email}</small>
        </div>

        <Row className="g-3">
          {[
            { label: 'Role', value: user.role?.name || '—', icon: 'ri:shield-user-line' },
            { label: 'Status', value: user.isActive ? 'Active' : 'Inactive', icon: 'ri:checkbox-circle-line' },
            { label: 'Verified', value: user.isVerified ? 'Yes' : 'No', icon: 'ri:verified-badge-line' },
            { label: 'Phone', value: user.phone || '—', icon: 'ri:phone-line' },
            { label: 'Location', value: user.location || '—', icon: 'ri:map-pin-line' },
            { label: 'Joined', value: fmt(user.createdAt), icon: 'ri:calendar-line' },
          ].map(({ label, value, icon }) => (
            <Col xs={6} key={label}>
              <div className="d-flex align-items-start gap-2">
                <IconifyIcon icon={icon} className="text-muted mt-1" />
                <div>
                  <small className="text-muted d-block">{label}</small>
                  <span className="fw-medium">{value}</span>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {user.permissions && user.permissions.length > 0 && (
          <div className="mt-3">
            <small className="text-muted d-block mb-1">Extra Permissions ({user.permissions.length})</small>
            <div className="d-flex flex-wrap gap-1">
              {user.permissions.slice(0, 8).map(p => (
                <Badge key={p} bg="light" text="dark" style={{ fontSize: '0.7rem' }}>{p}</Badge>
              ))}
              {user.permissions.length > 8 && <Badge bg="secondary">+{user.permissions.length - 8} more</Badge>}
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button variant="primary" onClick={() => { onHide(); onEdit(user) }}>
          <IconifyIcon icon="ri:edit-line" className="me-1" />Edit
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default UserViewModal
