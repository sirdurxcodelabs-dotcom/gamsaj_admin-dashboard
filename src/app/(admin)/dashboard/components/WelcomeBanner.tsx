import { Card, CardBody } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import type { DashboardData } from '../types'

const ROLE_MESSAGES: Record<string, { subtitle: string; icon: string; color: string }> = {
  'super-admin':              { subtitle: 'Full system access — all projects and users visible.', icon: 'ri:shield-star-line', color: 'danger' },
  'chairman':                 { subtitle: 'Strategic overview of all company projects and performance.', icon: 'ri:vip-crown-line', color: 'warning' },
  'managing-director':        { subtitle: 'Executive summary of ongoing operations and project status.', icon: 'ri:briefcase-4-line', color: 'primary' },
  'technical-director':       { subtitle: 'Technical project oversight and team performance.', icon: 'ri:tools-line', color: 'info' },
  'business-development-manager': { subtitle: 'Portfolio and project publication status.', icon: 'ri:line-chart-line', color: 'success' },
  'head-of-finance':          { subtitle: 'Project financial summary and status overview.', icon: 'ri:money-dollar-circle-line', color: 'success' },
  'administration-manager':   { subtitle: 'Team coordination and project administration.', icon: 'ri:admin-line', color: 'secondary' },
  'chief-engineer':           { subtitle: 'Technical project oversight across all engineering teams.', icon: 'ri:building-2-line', color: 'primary' },
  'project-manager':          { subtitle: 'Manage your assigned projects and post updates.', icon: 'ri:task-line', color: 'primary' },
  'resident-engineer':        { subtitle: 'Site progress tracking and update reporting.', icon: 'ri:map-pin-user-line', color: 'info' },
  'architect':                { subtitle: 'Design and construction progress on assigned projects.', icon: 'ri:draft-line', color: 'secondary' },
  'planner':                  { subtitle: 'Project planning and schedule tracking.', icon: 'ri:calendar-check-line', color: 'info' },
  'environmentalist':         { subtitle: 'Environmental compliance and project updates.', icon: 'ri:leaf-line', color: 'success' },
  'electrical-engineer':      { subtitle: 'Electrical works progress on assigned projects.', icon: 'ri:flashlight-line', color: 'warning' },
  'land-surveyor':            { subtitle: 'Survey data and site progress updates.', icon: 'ri:map-2-line', color: 'info' },
  'quantity-surveyor':        { subtitle: 'Quantity and cost tracking on assigned projects.', icon: 'ri:calculator-line', color: 'secondary' },
  'technician':               { subtitle: 'Your assigned project tasks and updates.', icon: 'ri:settings-3-line', color: 'secondary' },
  'artisan':                  { subtitle: 'Your assigned work and project updates.', icon: 'ri:hammer-line', color: 'secondary' },
  'subcontractor':            { subtitle: 'Your assigned project scope and updates.', icon: 'ri:user-received-line', color: 'secondary' },
}

interface Props {
  user: DashboardData['user']
}

const WelcomeBanner = ({ user }: Props) => {
  const config = ROLE_MESSAGES[user.roleSlug] || { subtitle: 'Welcome to your dashboard.', icon: 'ri:dashboard-line', color: 'primary' }
  return (
    <Card className={`bg-${config.color}-subtle border-0 mb-3`}>
      <CardBody className="d-flex align-items-center gap-3 py-3">
        <div className={`avatar-md flex-shrink-0`}>
          <div className={`avatar-title bg-${config.color} text-white fs-24 rounded`}>
            <IconifyIcon icon={config.icon} />
          </div>
        </div>
        <div>
          <h5 className="mb-1">Welcome back, {user.name}</h5>
          <p className="mb-0 text-muted small">{user.roleName} — {config.subtitle}</p>
        </div>
      </CardBody>
    </Card>
  )
}

export default WelcomeBanner
