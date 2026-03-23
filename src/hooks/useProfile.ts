import { useState, useEffect } from 'react'
import { userAPI, roleAPI } from '@/services/api'
import { ProfileData, UpdateProfileData, ChangePasswordData, PermissionType } from '@/types/auth'

export const useProfile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [allPermissions, setAllPermissions] = useState<PermissionType[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await userAPI.getProfile()
      setProfile(response.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch profile')
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch all permissions (for Super Admin)
  const fetchAllPermissions = async () => {
    try {
      const response = await roleAPI.getAllPermissions()
      setAllPermissions(response.data.data || [])
    } catch (err: any) {
      console.error('Error fetching permissions:', err)
    }
  }

  // Update profile
  const updateProfile = async (data: UpdateProfileData) => {
    try {
      setUpdating(true)
      setError(null)
      const response = await userAPI.updateProfile(data)
      setProfile(response.data.data)
      return { success: true, message: 'Profile updated successfully' }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile'
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setUpdating(false)
    }
  }

  // Change password
  const changePassword = async (data: ChangePasswordData) => {
    try {
      setUpdating(true)
      setError(null)
      await userAPI.changePassword(data)
      return { success: true, message: 'Password changed successfully' }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to change password'
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setUpdating(false)
    }
  }

  // Load profile on mount
  useEffect(() => {
    fetchProfile()
  }, [])

  return {
    profile,
    allPermissions,
    loading,
    updating,
    error,
    fetchProfile,
    fetchAllPermissions,
    updateProfile,
    changePassword,
  }
}
