import { Col, Container, Row } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import AuthLogo from '@/components/AuthLogo'
import logoutImg from '@/assets/images/svg/logout.svg'

const BG = 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80'

const Logout = () => {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(p => { if (p <= 1) { clearInterval(interval); return 0 } return p - 1 })
    }, 1000)
    const timer = setTimeout(() => navigate('/auth/login'), 5000)
    return () => { clearInterval(interval); clearTimeout(timer) }
  }, [navigate])

  return (
    <div className="auth-bg">
      <Container>
        <Row className="justify-content-center">
          <Col xl={8} lg={10}>
            <div className="auth-card card">
              <Row className="g-0">
                <Col lg={7} className="d-none d-lg-block">
                  <div className="auth-panel-side h-100" style={{ backgroundImage: `url('${BG}')` }}>
                    <div className="auth-panel-overlay" />
                    <div className="auth-panel-content">
                      <span className="auth-panel-badge">Signed Out</span>
                      <h2 className="auth-panel-title">Thank You<br />Come Back Soon</h2>
                      <p className="auth-panel-sub">Keep building Nigeria's future with GAMSAJ</p>
                    </div>
                  </div>
                </Col>
                <Col lg={5} className="auth-form-side">
                  <AuthLogo />
                  <div className="auth-form-body text-center">
                    <img src={logoutImg} alt="logout" style={{ maxHeight: 100, marginBottom: 16 }} />
                    <h2 className="auth-title">See You Again!</h2>
                    <p className="auth-subtitle">You have been signed out successfully.</p>
                    <div className="alert mb-3" style={{
                      background: 'rgba(253,126,20,0.1)',
                      border: '1px solid rgba(253,126,20,0.3)',
                      color: '#e8590c',
                      fontSize: 13,
                      borderRadius: 8,
                    }}>
                      <i className="ri-time-line me-2" />
                      Redirecting in <strong>{countdown}</strong> second{countdown !== 1 ? 's' : ''}...
                    </div>
                    <Link to="/auth/login" className="btn-auth btn d-block">
                      <i className="ri-login-box-line me-2" />Sign In Again
                    </Link>
                  </div>
                  <p className="auth-footer-text">
                    © {new Date().getFullYear()} GAMSAJ International Limited — RC: 965221
                  </p>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Logout
