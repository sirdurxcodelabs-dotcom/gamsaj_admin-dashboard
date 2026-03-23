import AuthLogo from '@/components/AuthLogo'
import { useAuthContext } from '@/context/useAuthContext'
import { Link } from 'react-router-dom'
import { Card, Col, Container, Row } from 'react-bootstrap'
import LockScreenForm from './components/LockScreenForm'

import authImg from '@/assets/images/auth-img.jpg'
import avatar1 from '@/assets/images/users/avatar-1.jpg'

const LockScreen = () => {
  const { user } = useAuthContext()
  
  const displayName = user?.name || 'User'
  const userAvatar = user?.avatar || avatar1

  return (
    <div className="account-pages p-sm-5  position-relative">
      <Container>
        <Row className="justify-content-center">
          <Col xxl={9} lg={11}>
            <Card className="overflow-hidden">
              <Row className="g-0">
                <Col lg={6}>
                  <div className="d-flex flex-column h-100">
                    <AuthLogo />
                    <div className="p-4 my-auto">
                      <div className="text-center w-75 m-auto">
                        <img src={userAvatar} height={64} alt="user-image" className="w-auto rounded-circle img-fluid img-thumbnail avatar-xl" />
                        <h4 className="text-center mt-3 fw-bold fs-20">Hi ! {displayName}</h4>
                        <p className="text-muted mb-4">Enter your password to access the admin.</p>
                        <p className="text-warning mb-4"><small>Session will expire in 5 minutes</small></p>
                      </div>
                      <LockScreenForm />
                    </div>
                  </div>
                </Col>
                <Col lg={6} className="d-none d-lg-block">
                  <img src={authImg} alt="image" className="img-fluid rounded h-100" />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col xs={12} className="text-center">
            <p className="text-dark-emphasis">
              Not you?
              <Link to="/auth/login" className="text-dark fw-bold ms-1 link-offset-3 text-decoration-underline">
                <b>Sign in with different account</b>
              </Link>
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
export default LockScreen
