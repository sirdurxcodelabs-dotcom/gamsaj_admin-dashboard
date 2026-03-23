import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row } from 'react-bootstrap'
import RolesTable from './components/RolesTable'

const RolesPage = () => (
  <>
    <PageTitle title="Roles Management" />
    <Row>
      <Col xs={12}>
        <Card>
          <CardBody>
            <RolesTable />
          </CardBody>
        </Card>
      </Col>
    </Row>
  </>
)

export default RolesPage
