import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Row } from 'react-bootstrap'
import { BlogsTable } from './components'

const Blogs = () => {
  return (
    <>
      <PageTitle title="Blog Management" />
      <Row>
        <Col xs={12}>
          <Card>
            <CardBody>
              <BlogsTable />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default Blogs
