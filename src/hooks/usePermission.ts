import { useAuthContext } from '@/context/useAuthContext'

/**
 * Hook to check if user has specific permission(s)
 * @param permissions - Single permission or array of permissions
 * @returns boolean - true if user has ANY of the specified permissions
 */
export const usePermission = (permissions: string | string[]): boolean => {
  const { user } = useAuthContext()

  if (!user || !user.permissions) {
    return false
  }

  const permissionsArray = Array.isArray(permissions) ? permissions : [permissions]
  
  return permissionsArray.some(permission => 
    user.permissions.includes(permission)
  )
}

/**
 * Hook to check if user has all specified permissions
 * @param permissions - Array of permissions
 * @returns boolean - true if user has ALL specified permissions
 */
export const useAllPermissions = (permissions: string[]): boolean => {
  const { user } = useAuthContext()

  if (!user || !user.permissions) {
    return false
  }

  return permissions.every(permission => 
    user.permissions.includes(permission)
  )
}

/**
 * Get all user permissions
 * @returns string[] - Array of permission slugs
 */
export const useUserPermissions = (): string[] => {
  const { user } = useAuthContext()
  return user?.permissions || []
}
