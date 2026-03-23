import { useEffect, useState } from 'react'
import { Alert, Col, Row, Spinner } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
import { dashboardAPI } from '@/services/api'
import { useAuthContext } from '@/context/useAuthContext'
import type { DashboardData } from './types'

import WelcomeBanner from './components/WelcomeBanner'
import StatCards from './components/StatCards'
import RecentUpdatesFeed from './components/RecentUpdatesFeed'
import ProjectPerformanceTable from './components/ProjectPerformanceTable'
import MyContributions from './components/MyContributions'

// Roles that see the full executive/strategic view
const EXECUTIVE_SLUGS = ['super-admin', 'chairman', 'managing-director', 'technical-director']
// Roles that see management-level view
const MANAGEMENT_SLUGS = ['business-development-manager', 'head-of-finance', 'administration-manager']
// Roles with simplified dashboards
const FIELD_SLUGS = ['technician', 'artisan', 'subcontractor']

const Dashboard = () => {
  useAuthContext()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const res = await dashboardAPI.get()
        if (res.data.success) setData(res.data.data)
        else setError(res.data.message || 'Failed to load dashboard')
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return (
    <>
      <PageTitle title="Dashboard" />
      <div className="text-center py-5"><Spinner variant="primary" /></div>
    </>
  )

  if (error || !data) return (
    <>
      <PageTitle title="Dashboard" />
      <Alert variant="danger">{error || 'Could not load dashboard data.'}</Alert>
    </>
  )

  const { user, projectCounts, recentUpdates, myContributions, projectPerformance, orgStats } = data
  const roleSlug = user.roleSlug
  const isExecutive = EXECUTIVE_SLUGS.includes(roleSlug)
  const isManagement = MANAGEMENT_SLUGS.includes(roleSlug)
  const isField = FIELD_SLUGS.includes(roleSlug)
  const isTechnical = !isExecutive && !isManagement && !isField

  return (
    <>
      <PageTitle title="Dashboard" />

      <WelcomeBanner user={user} />

      {/* ── Stat Cards ── */}
      <StatCards
        counts={projectCounts}
        loading={false}
        global={user.hasGlobalAccess}
        orgStats={orgStats}
      />

      {/* ── EXECUTIVE: full strategic view ── */}
      {isExecutive && (
        <>
          <Row className="g-3 mb-3">
            <Col lg={8}>
              <ProjectPerformanceTable projects={projectPerformance} loading={false} title="All Projects Performance" />
            </Col>
            <Col lg={4}>
              <RecentUpdatesFeed updates={recentUpdates} loading={false} title="Latest Activity" />
            </Col>
          </Row>
          {orgStats && (
            <Row className="g-3">
              <Col xs={12}>
                <div className="alert alert-info d-flex align-items-center gap-2 mb-0">
                  <span>
                    <strong>{orgStats.publishedProjects}</strong> completed projects published to the website ·
                    <strong className="ms-2">{orgStats.totalUsers}</strong> active users in the system
                  </span>
                </div>
              </Col>
            </Row>
          )}
        </>
      )}

      {/* ── MANAGEMENT: summary + updates ── */}
      {isManagement && (
        <Row className="g-3">
          <Col lg={7}>
            <ProjectPerformanceTable projects={projectPerformance} loading={false} title="Project Summary" />
          </Col>
          <Col lg={5}>
            <RecentUpdatesFeed updates={recentUpdates} loading={false} />
          </Col>
        </Row>
      )}

      {/* ── TECHNICAL / EXECUTION: assigned projects + contributions ── */}
      {isTechnical && (
        <Row className="g-3">
          <Col lg={8}>
            <ProjectPerformanceTable
              projects={projectPerformance}
              loading={false}
              title={user.hasGlobalAccess ? 'All Projects' : 'My Assigned Projects'}
            />
          </Col>
          <Col lg={4}>
            <Row className="g-3">
              <Col xs={12}>
                <RecentUpdatesFeed updates={recentUpdates} loading={false} title="Project Activity" />
              </Col>
              <Col xs={12}>
                <MyContributions contributions={myContributions} loading={false} />
              </Col>
            </Row>
          </Col>
        </Row>
      )}

      {/* ── FIELD: simple assigned view ── */}
      {isField && (
        <Row className="g-3">
          <Col lg={6}>
            <ProjectPerformanceTable
              projects={projectPerformance}
              loading={false}
              title="My Assigned Projects"
            />
          </Col>
          <Col lg={6}>
            <MyContributions contributions={myContributions} loading={false} />
          </Col>
        </Row>
      )}
    </>
  )
}

export default Dashboard
