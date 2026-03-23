import AuthLogo from '@/components/AuthLogo'
import { Link } from 'react-router-dom'
import { Card, Col, Container, Row } from 'react-bootstrap'
import authImg from '@/assets/images/auth-img.jpg'
import ResetPasswordForm from './components/ResetPasswordForm'

const ResetPassword = () => (
  <div className="account-pages p-sm-5 position-relative">
    <Container>
      <Row className="justify-content-center">
        <Col xxl={9} lg={11}>
          <Card className="overflow-hidden">
            <Row className="g-0">
              <Col lg={6}>
                <div className="d-flex flex-column h-100">
                  <AuthLogo />
                  <div className="p-4 my-auto text-center">
                    <h4 className="fs-20">Set New Password</h4>
                    <p className="text-muted mb-3">Enter and confirm your new password below.</p>
                    <ResetPasswordForm />
                  </div>
                </div>
              </Col>
              <Col lg={6} className="d-none d-lg-block">
                <img src={authImg} alt="auth" className="img-fluid rounded h-100" />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col xs={12} className="text-center">
          <p className="text-dark-emphasis">
            Remember your password?{' '}
            <Link to="/auth/login" className="text-dark fw-bold ms-1 link-offset-3 text-decoration-underline">Sign in</Link>
          </p>
        </Col>
      </Row>
    </Container>
  </div>
)

export default ResetPassword
