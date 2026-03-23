export interface DashboardUpdate {
  _id: string
  projectId: string
  projectTitle: string
  projectSlug: string
  title: string
  description: string
  type: string
  images: { url: string }[]
  createdBy: { _id: string; name: string; avatar?: string } | null
  createdAt: string
}

export interface ProjectPerformance {
  _id: string
  title: string
  slug: string
  status: string
  category: string
  location: string
  progressPercent: number
  teamCount: number
  updatesCount: number
  lastUpdateDate: string | null
  daysSinceUpdate: number | null
  health: 'healthy' | 'at-risk' | 'no-update'
  featuredImage?: { url: string }
}

export interface DashboardData {
  user: {
    _id: string
    name: string
    email: string
    roleSlug: string
    roleName: string
    permissions: string[]
    hasGlobalAccess: boolean
  }
  projectCounts: {
    total: number
    ongoing: number
    planned: number
    completed: number
    onHold: number
    cancelled: number
  }
  recentUpdates: DashboardUpdate[]
  myContributions: {
    _id: string
    projectId: string
    projectTitle: string
    title: string
    type: string
    createdAt: string
  }[]
  projectPerformance: ProjectPerformance[]
  orgStats: { totalUsers: number; publishedProjects: number } | null
}
