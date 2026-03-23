export type UserType = {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
  token: string
  avatar?: string
  isVerified?: boolean
  isActive?: boolean
  phone?: string
  location?: string
  bio?: string
  website?: string
  socialMedia?: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
  }
  roleId?: string
  roleName?: string
  roleSlug?: string
}

export type ProfileData = {
  _id: string
  name: string
  email: string
  phone: string
  location: string
  bio: string
  website: string
  avatar: string
  roleId: string
  role: {
    name: string
    slug: string
    permissions: string[]
  }
  socialMedia: {
    facebook: string
    twitter: string
    instagram: string
    linkedin: string
  }
  isVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type UpdateProfileData = {
  name?: string
  email?: string
  phone?: string
  location?: string
  bio?: string
  website?: string
  socialMedia?: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
  }
}

export type ChangePasswordData = {
  currentPassword: string
  newPassword: string
}

export type PermissionType = {
  _id: string
  name: string
  category: string
  action: string
  resource: string
}
