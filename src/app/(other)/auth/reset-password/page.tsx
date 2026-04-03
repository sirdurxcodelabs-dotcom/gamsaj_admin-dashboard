import { Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import AuthLogo from '@/components/AuthLogo'
import ResetPasswordForm from './components/ResetPasswordForm'

const BG = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80'

const ResetPassword = () => (
  <div className="auth-bg">
    <Container>
      <Row className="justify-content-center">
        <Col xxl={9} lg={11}>
          <div className="auth-card card">
            <Row className="g-0">
              <Col lg={7} className="d-none d-lg-block">
                <div className="auth-panel-side h-100" style={{ backgroundImage: `url('${BG}')` }}>
                  <div className="auth-panel-overlay" />
                  <div className="auth-panel-content">
                    <span className="auth-panel-badge">Password Reset</span>
                    <h2 className="auth-panel-title">Keep Your<br />Account Safe</h2>
                    <p className="auth-panel-sub">
                      Use a strong password to protect your GAMSAJ admin access
                    </p>
                  </div>
                </div>
              </Col>
              <Col lg={5} className="auth-form-side">
                <AuthLogo />
                <div className="auth-form-body text-center">
                  <div className="auth-icon-circle mx-auto">
                    <i className="ri-shield-keyhole-line" />
                  </div>
                  <h2 className="auth-title">Set New Password</h2>
                  <p className="auth-subtitle">Enter and confirm your new password below.</p>
                  <ResetPasswordForm />
                  <p className="text-center mt-3 mb-0" style={{ fontSize: 13 }}>
                    <Link to="/auth/login" className="auth-link">← Back to Sign In</Link>
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

export default ResetPassword
