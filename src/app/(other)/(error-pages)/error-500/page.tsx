import { Link } from 'react-router-dom'
import { Card, Col, Container, Row } from 'react-bootstrap'
import errorImg from '@/assets/images/svg/500.svg'
import authImg from '@/assets/images/auth-img.jpg'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import AuthLogo from '@/components/AuthLogo'

const Error500 = () => {
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
                    <div className="p-4 mt-auto">
                      <div className="d-flex justify-content-center mb-5">
                        <img src={errorImg} alt="error-image" className="img-fluid" />
                      </div>
                      <div className="text-center">
                        <h1 className="mb-3">500</h1>
                        <h4 className="fs-20">Internal server error</h4>
                        <p className="text-muted mb-3">
                          
                          Why not try refreshing your page? or you can contact
                          <Link to="" className="text-primary">
                            <b>Support</b>
                          </Link>
                        </p>
                      </div>
                      <Link to="/" className="btn btn-soft-primary w-100">
                        <IconifyIcon icon="ri:home-4-line" className="me-1" /> Back to Home
                      </Link>
                    </div>
                  </div>
                </Col>
                <Col lg={6} className="d-none d-lg-block">
                  <img src={authImg} alt="img" className="img-fluid rounded h-100" />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col xs={12} className="text-center">
            <p className="text-dark-emphasis">
              Don&apos;t have an account?
              <Link to="/auth/register" className="text-dark fw-bold ms-1 link-offset-3 text-decoration-underline">
                <b>Sign up</b>
              </Link>
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
export default Error500
