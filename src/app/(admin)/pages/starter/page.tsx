import PageTitle from '@/components/PageTitle'
import { Card, Col, Row } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'

const Starter = () => {
  const location = useLocation()
  
  // Map routes to page names
  const pageNames: Record<string, string> = {
    '/content/projects': 'Projects',
    '/content/blogs': 'Blogs',
    '/content/company-info': 'Company Information',
    '/apps/email': 'Email',
    '/apps/invoices': 'Invoice List',
    '/admin/users': 'Users',
    '/admin/roles': 'Roles & Permissions',
    '/pages/starter': 'Starter Page',
  }
  
  const pageName = pageNames[location.pathname] || 'Page'
  const isStarterPage = location.pathname === '/pages/starter'
  
  return (
    <>
      <PageTitle title={pageName} />
      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <div className="text-center py-5">
                <div className="mb-4">
                  <i className="ri-file-text-line" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                </div>
                <h3 className="mb-3">{pageName}</h3>
                {!isStarterPage ? (
                  <>
                    <p className="text-muted mb-4">
                      This page is currently under development and will be available soon.
                    </p>
                    <div className="alert alert-info d-inline-block">
                      <i className="ri-information-line me-2"></i>
                      Using starter page as placeholder
                    </div>
                  </>
                ) : (
                  <p className="text-muted mb-4">
                    This is a starter page template. You can use this as a base for building new pages.
                  </p>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
}
export default Starter
