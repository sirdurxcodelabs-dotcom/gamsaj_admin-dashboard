import { Badge, Card, CardBody, Col, Row } from 'react-bootstrap'
import { PermissionType } from '@/types/auth'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

type PermissionsMatrixProps = {
  allPermissions: PermissionType[]
  userPermissions: string[]
}

const PermissionsMatrix = ({ allPermissions, userPermissions }: PermissionsMatrixProps) => {
  // Group permissions by category
  const groupedPermissions = allPermissions.reduce((acc, permission) => {
    const category = permission.category || 'other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(permission)
    return acc
  }, {} as Record<string, PermissionType[]>)

  const hasPermission = (permissionName: string) => {
    return userPermissions.includes(permissionName)
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      main: 'primary',
      app: 'success',
      content: 'info',
      pages: 'warning',
      admin: 'danger',
      navigation: 'secondary',
    }
    return colors[category.toLowerCase()] || 'dark'
  }

  return (
    <div>
      <div className="alert alert-info mb-4">
        <IconifyIcon icon="mdi:information" className="me-2" />
        <strong>Super Admin View:</strong> This matrix shows all available permissions in the system. Your assigned
        permissions are highlighted with checkmarks.
      </div>

      <Row>
        {Object.entries(groupedPermissions).map(([category, permissions]) => (
          <Col md={6} lg={4} key={category} className="mb-4">
            <Card className="h-100">
              <CardBody>
                <h5 className="text-uppercase mb-3">
                  <Badge bg={getCategoryColor(category)} className="me-2">
                    {category}
                  </Badge>
                  <span className="text-muted fs-14">({permissions.length})</span>
                </h5>
                <div className="d-flex flex-column gap-2">
                  {permissions.map((permission) => (
                    <div
                      key={permission._id}
                      className={`d-flex align-items-center p-2 rounded ${
                        hasPermission(permission.name) ? 'bg-success-subtle' : 'bg-light'
                      }`}
                    >
                      {hasPermission(permission.name) ? (
                        <IconifyIcon icon="mdi:check-circle" className="text-success me-2 fs-18" />
                      ) : (
                        <IconifyIcon icon="mdi:circle-outline" className="text-muted me-2 fs-18" />
                      )}
                      <div className="flex-grow-1">
                        <div className="fw-semibold fs-13">{permission.name}</div>
                        <div className="text-muted fs-12">
                          {permission.action} {permission.resource}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default PermissionsMatrix
