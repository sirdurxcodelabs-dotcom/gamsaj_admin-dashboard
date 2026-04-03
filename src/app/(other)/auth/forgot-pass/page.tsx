import { Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import AuthLogo from '@/components/AuthLogo'
import ForgotPasswordForm from './components/ForgotPasswordForm'

const BG = 'https://images.unsplash.com/photo-1590644365607-5f3e8e7e3b3e?w=1200&q=80'

const ForgotPassword = () => (
  <div className="auth-bg">
    <Container>
      <Row className="justify-content-center">
        <Col xxl={9} lg={11}>
          <div className="auth-card card">
            <Row className="g-0">
              <Col lg={5} className="auth-form-side">
                <AuthLogo />
                <div className="auth-form-body text-center">
                  <div className="auth-icon-circle mx-auto">
                    <i className="ri-lock-password-line" />
                  </div>
                  <h2 className="auth-title">Forgot Password?</h2>
                  <p className="auth-subtitle">
                    Enter your email and we'll send you a reset link. It expires in 10 minutes.
                  </p>
                  <ForgotPasswordForm />
                  <p className="text-center mt-3 mb-0" style={{ fontSize: 13 }}>
                    Remember it?{' '}
                    <Link to="/auth/login" className="auth-link">Sign In</Link>
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
                    <span className="auth-panel-badge">Account Recovery</span>
                    <h2 className="auth-panel-title">Secure Access<br />Always</h2>
                    <p className="auth-panel-sub">
                      Your GAMSAJ account is protected with enterprise-grade security
                    </p>
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

export default ForgotPassword
