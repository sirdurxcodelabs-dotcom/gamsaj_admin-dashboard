import { Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import AuthLogo from '@/components/AuthLogo'
import LoginForm from './components/LoginForm'

const BG = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80'

const Login = () => (
  <div className="auth-bg">
    <Container>
      <Row className="justify-content-center">
        <Col xxl={10} lg={11}>
          <div className="auth-card card">
            <Row className="g-0">
              {/* Form side */}
              <Col lg={5} className="auth-form-side">
                <AuthLogo />
                <div className="auth-form-body">
                  <h2 className="auth-title">Welcome Back</h2>
                  <p className="auth-subtitle">Sign in to GAMSAJ Admin Dashboard</p>
                  <LoginForm />
                  <p className="text-center mt-3 mb-0" style={{ fontSize: 13 }}>
                    Need an account?{' '}
                    <Link to="/auth/register" className="auth-link">Register here</Link>
                  </p>
                </div>
                <p className="auth-footer-text">
                  © {new Date().getFullYear()} GAMSAJ International Limited — RC: 965221
                </p>
              </Col>

              {/* Panel side */}
              <Col lg={7} className="d-none d-lg-block">
                <div className="auth-panel-side h-100" style={{ backgroundImage: `url('${BG}')` }}>
                  <div className="auth-panel-overlay" />
                  <div className="auth-panel-content">
                    <span className="auth-panel-badge">GAMSAJ International Limited</span>
                    <h2 className="auth-panel-title">Building Nigeria's<br />Infrastructure</h2>
                    <p className="auth-panel-sub">Civil Engineering · Real Estate · Industrial Construction</p>
                    <div className="auth-panel-stats">
                      <div className="stat-item">
                        <div className="stat-value">14+</div>
                        <div className="stat-label">Years Active</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">200+</div>
                        <div className="stat-label">Projects Done</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">RC 965221</div>
                        <div className="stat-label">Registered</div>
                      </div>
                    </div>
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

export default Login
