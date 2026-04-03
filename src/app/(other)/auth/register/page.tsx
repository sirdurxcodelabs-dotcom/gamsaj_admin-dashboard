import { Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import AuthLogo from '@/components/AuthLogo'
import RegisterForm from './components/RegisterForm'

const BG = 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80'

const Register = () => (
  <div className="auth-bg">
    <Container>
      <Row className="justify-content-center">
        <Col xxl={10} lg={11}>
          <div className="auth-card card">
            <Row className="g-0">
              {/* Panel side — left for register (reversed) */}
              <Col lg={7} className="d-none d-lg-block order-lg-1">
                <div className="auth-panel-side h-100" style={{ backgroundImage: `url('${BG}')` }}>
                  <div className="auth-panel-overlay" />
                  <div className="auth-panel-content">
                    <span className="auth-panel-badge">Join the Team</span>
                    <h2 className="auth-panel-title">Building Nigeria<br />Together</h2>
                    <p className="auth-panel-sub">Create your admin account to manage GAMSAJ operations</p>
                    <div className="auth-panel-stats">
                      <div className="stat-item">
                        <div className="stat-value">6</div>
                        <div className="stat-label">Role Levels</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">49+</div>
                        <div className="stat-label">Permissions</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">100%</div>
                        <div className="stat-label">Secure</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>

              {/* Form side */}
              <Col lg={5} className="auth-form-side order-lg-2">
                <AuthLogo />
                <div className="auth-form-body">
                  <h2 className="auth-title">Create Account</h2>
                  <p className="auth-subtitle">Register a new GAMSAJ admin user</p>
                  <RegisterForm />
                  <p className="text-center mt-3 mb-0" style={{ fontSize: 13 }}>
                    Already have an account?{' '}
                    <Link to="/auth/login" className="auth-link">Sign In</Link>
                  </p>
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

export default Register
