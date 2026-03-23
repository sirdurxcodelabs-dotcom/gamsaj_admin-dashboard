import { useState } from 'react'
import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Nav, NavItem, NavLink, Row, TabContainer, TabContent, TabPane } from 'react-bootstrap'
import AboutTab from './components/AboutTab'
import NavigationTab from './components/NavigationTab'

const CompanyInformation = () => {
  const [activeTab, setActiveTab] = useState('about')

  return (
    <>
      <PageTitle title="Company Information" />
      <Row>
        <Col xs={12}>
          <Card>
            <CardBody>
              <TabContainer activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)}>
                <Nav variant="tabs" className="mb-4">
                  <NavItem>
                    <NavLink eventKey="about" style={{ cursor: 'pointer' }}>
                      <i className="ri-building-line me-1" />About the Company
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink eventKey="navigation" style={{ cursor: 'pointer' }}>
                      <i className="ri-navigation-line me-1" />Navigation
                    </NavLink>
                  </NavItem>
                </Nav>
                <TabContent>
                  <TabPane eventKey="about">
                    <AboutTab />
                  </TabPane>
                  <TabPane eventKey="navigation">
                    <NavigationTab />
                  </TabPane>
                </TabContent>
              </TabContainer>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default CompanyInformation
