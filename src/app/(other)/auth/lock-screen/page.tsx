import { Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import AuthLogo from '@/components/AuthLogo'
import { useAuthContext } from '@/context/useAuthContext'
import LockScreenForm from './components/LockScreenForm'
import avatar1 from '@/assets/images/users/avatar-1.jpg'

const BG = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=80'

const LockScreen = () => {
  const { user } = useAuthContext()
  const displayName = user?.name || 'User'
  const userAvatar = (user as any)?.avatar || avatar1

  return (
    <div className="auth-bg">
      <Container>
        <Row className="justify-content-center">
          <Col xl={8} lg={10}>
            <div className="auth-card card">
              <Row className="g-0">
                <Col lg={5} className="auth-form-side">
                  <AuthLogo />
                  <div className="auth-form-body text-center">
                    <img
                      src={userAvatar}
                      alt={displayName}
                      style={{
                        width: 72, height: 72, borderRadius: '50%', objectFit: 'cover',
                        border: '3px solid #fd7e14', marginBottom: 12,
                      }}
                    />
                    <h2 className="auth-title">Hi, {displayName}</h2>
                    <p className="auth-subtitle">Enter your password to unlock your session.</p>
                    <div className="alert alert-warning py-2 mb-3" style={{ fontSize: 12 }}>
                      <i className="ri-time-line me-1" />Session expires in 5 minutes
                    </div>
                    <LockScreenForm />
                    <p className="text-center mt-3 mb-0" style={{ fontSize: 13 }}>
                      Not you?{' '}
                      <Link to="/auth/login" className="auth-link">Sign in with different account</Link>
                    </p>
                  </div>
                  <p className="auth-footer-text">
                    © {new Date().getFullYear()} GAMSAJ International Limited — RC: 965221
                  </p>
                </Col>
                <Col lg={7} className="d-none d-lg-block">
                  <div className="auth-panel-side h-100" style={{ backgroundImage: `url('${BG}')` }}>
                    <div className="auth-panel-overlay" />
                    <div className="auth-panel-content">
                      <span className="auth-panel-badge">Session Locked</span>
                      <h2 className="auth-panel-title">Your Work<br />Is Safe</h2>
                      <p className="auth-panel-sub">Just verify it's you to continue where you left off</p>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default LockScreen
