import { useState, useEffect } from 'react'
import { Button, Card, Col, Row, Tab, Tabs, Badge, Spinner, Dropdown } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useAuthContext } from '@/context/useAuthContext'
import ContactsTable from './components/ContactsTable.tsx'
import SubscribersTable from './components/SubscribersTable.tsx'
import ConnectionStats from './components/ConnectionStats.tsx'
import { connectionsAPI } from '@/services/api'

const Connections = () => {
  const { user } = useAuthContext()
  const [activeTab, setActiveTab] = useState('contacts')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [searchTerm] = useState('')
  const [statusFilter] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const canManage = user?.permissions?.includes('connections.manage') ?? false
  const canDelete = user?.permissions?.includes('connections.delete') ?? false
  const canExport = user?.permissions?.includes('connections.export') ?? false

  useEffect(() => {
    fetchStats()
  }, [refreshKey])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await connectionsAPI.getConnections({ page: 1, limit: 1 })
      setStats(response.data.stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (type: 'contact' | 'subscriber' | 'all') => {
    try {
      const response = await connectionsAPI.exportConnections(type === 'all' ? undefined : type)
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `connections-${type}-${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting:', error)
      alert('Failed to export connections')
    }
  }

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  if (loading && !stats) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading connections...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageTitle title="Connections" />
      
      <Row>
        <Col xs={12}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 className="mb-1">Connections Management</h4>
              <p className="text-muted mb-0">Manage contact forms and newsletter subscribers</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="soft-primary" size="sm" onClick={handleRefresh}>
                <IconifyIcon icon="mdi:refresh" className="me-1" />
                Refresh
              </Button>
              {canExport && (
                <Dropdown>
                  <Dropdown.Toggle variant="soft-success" size="sm">
                    <IconifyIcon icon="mdi:download" className="me-1" />
                    Export
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleExport('contact')}>
                      <IconifyIcon icon="mdi:email" className="me-2" />
                      Export Contacts
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleExport('subscriber')}>
                      <IconifyIcon icon="mdi:email-newsletter" className="me-2" />
                      Export Subscribers
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleExport('all')}>
                      <IconifyIcon icon="mdi:database-export" className="me-2" />
                      Export All
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {stats && <ConnectionStats stats={stats} />}

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => k && setActiveTab(k)}
                className="mb-3"
              >
                <Tab
                  eventKey="contacts"
                  title={
                    <span>
                      <IconifyIcon icon="mdi:email" className="me-1" />
                      Contact Forms
                      {stats && (
                        <Badge bg="primary" className="ms-2">
                          {stats.totalContacts}
                        </Badge>
                      )}
                    </span>
                  }
                >
                  <ContactsTable
                    searchTerm={searchTerm}
                    statusFilter={statusFilter}
                    canManage={canManage}
                    canDelete={canDelete}
                    refreshKey={refreshKey}
                    onRefresh={handleRefresh}
                  />
                </Tab>
                <Tab
                  eventKey="subscribers"
                  title={
                    <span>
                      <IconifyIcon icon="mdi:email-newsletter" className="me-1" />
                      Newsletter Subscribers
                      {stats && (
                        <Badge bg="success" className="ms-2">
                          {stats.totalSubscribers}
                        </Badge>
                      )}
                    </span>
                  }
                >
                  <SubscribersTable
                    searchTerm={searchTerm}
                    canDelete={canDelete}
                    refreshKey={refreshKey}
                    onRefresh={handleRefresh}
                  />
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default Connections
