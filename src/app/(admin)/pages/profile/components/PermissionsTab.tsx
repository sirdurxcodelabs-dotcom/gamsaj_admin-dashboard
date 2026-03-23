import { useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { ProfileData, PermissionType } from '@/types/auth'
import { roleAPI } from '@/services/api'
import PermissionsMatrix from './PermissionsMatrix'
import UserPermissions from './UserPermissions'

type PermissionsTabProps = {
  profile: ProfileData
  allPermissions: PermissionType[]
  onFetchPermissions: () => Promise<void>
}

const PermissionsTab = ({ profile, allPermissions, onFetchPermissions }: PermissionsTabProps) => {
  const isSuperAdmin = profile.role.slug === 'super-admin'
  const [rolePerms, setRolePerms] = useState<PermissionType[]>([])
  const [loadingRolePerms, setLoadingRolePerms] = useState(false)

  useEffect(() => {
    if (isSuperAdmin && allPermissions.length === 0) {
      onFetchPermissions()
    }
  }, [isSuperAdmin, allPermissions.length, onFetchPermissions])

  // For non-super-admin: fetch full permission objects for the user's role
  useEffect(() => {
    if (!isSuperAdmin && profile.roleId) {
      setLoadingRolePerms(true)
      roleAPI.getAllPermissions()
        .then(res => {
          if (res.data.success) {
            const all: PermissionType[] = res.data.data || []
            // Filter to only permissions the user's role has
            const userSlugs = new Set(profile.role.permissions)
            setRolePerms(all.filter(p => userSlugs.has(p.name) || userSlugs.has(p._id)))
          }
        })
        .catch(console.error)
        .finally(() => setLoadingRolePerms(false))
    }
  }, [isSuperAdmin, profile.roleId, profile.role.permissions])

  if (isSuperAdmin && allPermissions.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading permissions...</p>
      </div>
    )
  }

  if (!isSuperAdmin && loadingRolePerms) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading your permissions...</p>
      </div>
    )
  }

  return (
    <div>
      {isSuperAdmin ? (
        <PermissionsMatrix allPermissions={allPermissions} userPermissions={profile.role.permissions} />
      ) : (
        <UserPermissions
          permissions={profile.role.permissions}
          permissionObjects={rolePerms}
          roleName={profile.role.name}
        />
      )}
    </div>
  )
}

export default PermissionsTab
