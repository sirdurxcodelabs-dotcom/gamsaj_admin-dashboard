import { Badge, Card, CardBody, Col, Row } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { PermissionType } from '@/types/auth'

type UserPermissionsProps = {
  permissions: string[]
  permissionObjects?: PermissionType[]
  roleName: string
}

const CATEGORY_COLORS: Record<string, string> = {
  main: 'primary', app: 'success', content: 'info', pages: 'warning',
  admin: 'danger', navigation: 'secondary', other: 'dark',
}

const formatSlug = (s: string) =>
  s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

const UserPermissions = ({ permissions, permissionObjects = [], roleName }: UserPermissionsProps) => {
  // Build grouped map — prefer rich objects, fall back to slug strings
  const grouped: Record<string, { name: string; slug: string }[]> = {}

  if (permissionObjects.length > 0) {
    permissionObjects.forEach(p => {
      const cat = p.category || 'other'
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push({ name: p.name, slug: p.name })
    })
  } else {
    // Fallback: group by slug prefix heuristic
    permissions.forEach(slug => {
      let cat = 'other'
      if (slug.includes('dashboard') || slug.includes('analytics')) cat = 'main'
      else if (slug.includes('user') || slug.includes('role') || slug.includes('permission')) cat = 'admin'
      else if (slug.includes('content') || slug.includes('blog') || slug.includes('company')) cat = 'content'
      else if (slug.includes('page')) cat = 'pages'
      else if (slug.includes('navigation') || slug.includes('nav')) cat = 'navigation'
      else if (slug.includes('app') || slug.includes('calendar') || slug.includes('email') || slug.includes('kanban')) cat = 'app'
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push({ name: formatSlug(slug), slug })
    })
  }

  return (
    <div>
      <div className="alert alert-primary mb-4">
        <IconifyIcon icon="mdi:shield-account" className="me-2" />
        <strong>Your Role:</strong> {roleName}
        <span className="ms-2 text-muted">({permissions.length} permissions)</span>
      </div>

      {permissions.length === 0 ? (
        <div className="text-center py-5">
          <IconifyIcon icon="mdi:shield-off" className="fs-48 text-muted mb-3" />
          <p className="text-muted">No permissions assigned to your role.</p>
        </div>
      ) : (
        <Row>
          {Object.entries(grouped).map(([category, perms]) => (
            <Col md={6} lg={4} key={category} className="mb-4">
              <Card className="h-100 border-start border-4" style={{ borderLeftColor: `var(--bs-${CATEGORY_COLORS[category] || 'dark'})` }}>
                <CardBody>
                  <h5 className="text-uppercase mb-3">
                    <Badge bg={CATEGORY_COLORS[category] || 'dark'} className="me-2">{category}</Badge>
                    <span className="text-muted fs-14">({perms.length})</span>
                  </h5>
                  <div className="d-flex flex-wrap gap-2">
                    {perms.map(p => (
                      <Badge key={p.slug} bg="light" text={CATEGORY_COLORS[category] || 'dark'} className="px-3 py-2 fs-12 fw-normal border">
                        <IconifyIcon icon="mdi:check" className="me-1" />
                        {p.name}
                      </Badge>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}

export default UserPermissions
