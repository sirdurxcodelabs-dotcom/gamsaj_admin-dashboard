// Permission Constants - Must match backend
export const PERMISSIONS = {
  // MAIN
  VIEW_DASHBOARD: 'view_dashboard',
  
  // APP
  VIEW_CALENDAR: 'view_calendar',
  MANAGE_CALENDAR: 'manage_calendar',
  VIEW_EMAIL: 'view_email',
  MANAGE_EMAIL: 'manage_email',
  VIEW_INVOICES: 'view_invoices',
  CREATE_INVOICES: 'create_invoices',
  UPDATE_INVOICES: 'update_invoices',
  DELETE_INVOICES: 'delete_invoices',
  MANAGE_INVOICES: 'manage_invoices',
  
  // CONTENT
  VIEW_PROJECTS: 'view_projects',
  CREATE_PROJECTS: 'create_projects',
  UPDATE_PROJECTS: 'update_projects',
  DELETE_PROJECTS: 'delete_projects',
  MANAGE_PROJECTS: 'manage_projects',
  VIEW_BLOGS: 'view_blogs',
  CREATE_BLOGS: 'create_blogs',
  UPDATE_BLOGS: 'update_blogs',
  DELETE_BLOGS: 'delete_blogs',
  MANAGE_BLOGS: 'manage_blogs',
  VIEW_COMPANY_INFO: 'view_company_info',
  UPDATE_COMPANY_INFO: 'update_company_info',
  MANAGE_COMPANY_INFO: 'manage_company_info',
  
  // PAGES
  VIEW_PROFILE: 'view_profile',
  UPDATE_PROFILE: 'update_profile',
  VIEW_STARTER: 'view_starter',
  VIEW_MAINTENANCE: 'view_maintenance',
  VIEW_ERROR_PAGES: 'view_error_pages',
  
  // ADMIN
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  UPDATE_USERS: 'update_users',
  DELETE_USERS: 'delete_users',
  MANAGE_USERS: 'manage_users',
  VIEW_ROLES: 'view_roles',
  CREATE_ROLES: 'create_roles',
  UPDATE_ROLES: 'update_roles',
  DELETE_ROLES: 'delete_roles',
  MANAGE_ROLES: 'manage_roles',
  
  // NAVIGATION
  VIEW_NAVIGATION: 'view_navigation',
  EDIT_NAVIGATION: 'edit_navigation',
  
  // CONNECTIONS
  VIEW_CONNECTIONS: 'connections.view',
  MANAGE_CONNECTIONS: 'connections.manage',
  DELETE_CONNECTIONS: 'connections.delete',
  EXPORT_CONNECTIONS: 'connections.export',
  
  // CALENDAR (Construction Projects & Legal)
  VIEW_CALENDAR_EVENTS: 'calendar.view',
  CREATE_CALENDAR_EVENTS: 'calendar.create',
  UPDATE_CALENDAR_EVENTS: 'calendar.update',
  DELETE_CALENDAR_EVENTS: 'calendar.delete',
  MANAGE_CALENDAR_EVENTS: 'calendar.manage',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]
