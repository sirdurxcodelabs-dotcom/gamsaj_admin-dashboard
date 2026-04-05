import { useState } from 'react'
import PageTitle from '@/components/PageTitle'
import { Card, CardBody, Col, Nav, NavItem, NavLink, Row, TabContainer, TabContent, TabPane } from 'react-bootstrap'
import AboutTab from './components/AboutTab'
import NavigationTab from './components/NavigationTab'
import TeamMembersTab from './components/TeamMembersTab'
import PartnersTab from './components/PartnersTab'
import TestimonialsTab from './components/TestimonialsTab'

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
                  <NavItem>
                    <NavLink eventKey="team" style={{ cursor: 'pointer' }}>
                      <i className="ri-team-line me-1" />Team Members
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink eventKey="partners" style={{ cursor: 'pointer' }}>
                      <i className="ri-shake-hands-line me-1" />Partners
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink eventKey="testimonials" style={{ cursor: 'pointer' }}>
                      <i className="ri-chat-quote-line me-1" />Testimonials
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
                  <TabPane eventKey="team">
                    <TeamMembersTab />
                  </TabPane>
                  <TabPane eventKey="partners">
                    <PartnersTab />
                  </TabPane>
                  <TabPane eventKey="testimonials">
                    <TestimonialsTab />
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
