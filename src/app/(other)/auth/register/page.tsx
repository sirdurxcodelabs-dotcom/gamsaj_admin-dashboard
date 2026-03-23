import { Card, Col, Container, Row } from 'react-bootstrap'
import AuthLogo from '@/components/AuthLogo'
import RegisterForm from './components/RegisterForm'

import { Link } from 'react-router-dom'


import authImg from '@/assets/images/auth-img.jpg'



const Register = () => {
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
                    <div className="p-4 my-auto text-center">
                      <h4 className="fs-20">Create Admin Account</h4>
                      <p className="text-muted mb-4">
                        Enter your details to create an <br /> admin account.
                      </p>
                      <RegisterForm />
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
              Already have an account?
              <Link to="/auth/login" className="text-dark fw-bold ms-1 link-offset-3 text-decoration-underline">
                <b>Sign In</b>
              </Link>
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
export default Register
