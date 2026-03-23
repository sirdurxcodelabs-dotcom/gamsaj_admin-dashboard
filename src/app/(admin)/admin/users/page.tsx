import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row } from 'react-bootstrap'
import UsersTable from './components/UsersTable'

const UsersPage = () => (
  <>
    <PageTitle title="User Management" />
    <Row>
      <Col xs={12}>
        <Card>
          <CardBody>
            <UsersTable />
          </CardBody>
        </Card>
      </Col>
    </Row>
  </>
)

export default UsersPage
