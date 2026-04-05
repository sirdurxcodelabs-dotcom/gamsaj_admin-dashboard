import axios from 'axios';

const API_URL = (() => {
  const url = import.meta.env.VITE_API_URL || 'https://gamsaj-api.onrender.com/api';
  // Ensure /api suffix is always present
  return url.endsWith('/api') ? url : url.replace(/\/$/, '') + '/api';
})();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const authData = document.cookie
      .split('; ')
      .find((row) => row.startsWith('_TECHMIN_AUTH_KEY_='));
    
    if (authData) {
      try {
        const user = JSON.parse(decodeURIComponent(authData.split('=')[1]));
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (error) {
        console.error('Error parsing auth token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (name: string, email: string, password: string, roleId?: string) =>
    api.post('/auth/register', { name, email, password, roleId }),
  
  getMe: () => api.get('/auth/me'),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    api.put(`/auth/reset-password/${token}`, { password }),
  
  verifyEmail: (token: string) =>
    api.get(`/auth/verify/${token}`),
};

// User endpoints
export const userAPI = {
  getUsers: (params?: { search?: string; role?: string; status?: string; page?: number; limit?: number }) =>
    api.get('/users', { params }),
  getUser: (id: string) => api.get(`/users/${id}`),
  createUser: (data: any) => api.post('/users', data),
  updateUser: (id: string, data: any) => api.put(`/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  toggleActive: (id: string) => api.put(`/users/${id}/toggle-active`),

  // Profile endpoints
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/users/change-password', data),
};

// Role endpoints
export const roleAPI = {
  getRoles: () => api.get('/roles'),
  getRole: (id: string) => api.get(`/roles/${id}`),
  createRole: (data: any) => api.post('/roles', data),
  updateRole: (id: string, data: any) => api.put(`/roles/${id}`, data),
  deleteRole: (id: string) => api.delete(`/roles/${id}`),
  cloneRole: (id: string, name: string) => api.post(`/roles/${id}/clone`, { name }),
  updateRolePermissions: (id: string, permissions: string[]) =>
    api.put(`/roles/${id}/permissions`, { permissions }),
  getAllPermissions: () => api.get('/roles/permissions/all'),
  getMatrix: () => api.get('/roles/matrix'),
};

// Upload endpoints
export const uploadAPI = {
  uploadSingle: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/single', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadMultiple: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return api.post('/upload/multiple', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/upload/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadSignature: (file: File) => {
    const formData = new FormData();
    formData.append('signature', file);
    return api.post('/upload/signature', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

// Connections endpoints
export const connectionsAPI = {
  // Public endpoints
  submitContact: (data: any) => api.post('/connections/contact', data),
  subscribe: (email: string) => api.post('/connections/subscribe', { email }),
  
  // Admin endpoints
  getConnections: (params?: any) => api.get('/connections', { params }),
  getConnection: (id: string) => api.get(`/connections/${id}`),
  getConnectionReply: (id: string) => api.get(`/connections/${id}/reply`),
  updateConnection: (id: string, data: any) => api.put(`/connections/${id}`, data),
  deleteConnection: (id: string) => api.delete(`/connections/${id}`),
  bulkDeleteConnections: (ids: string[]) => api.post('/connections/bulk-delete', { ids }),
  exportConnections: (type?: string) => api.get('/connections/export', { params: { type } }),
};

// Email endpoints
export const emailAPI = {
  // Get emails by folder
  getEmails: (params?: {
    folder?: string;
    page?: number;
    limit?: number;
    search?: string;
    isRead?: boolean;
    contactId?: string;
  }) => api.get('/emails', { params }),

  // Get single email
  getEmail: (id: string) => api.get(`/emails/${id}`),

  // Get reply for a connection
  getConnectionReply: (connectionId: string) => api.get(`/emails/connection/${connectionId}/reply`),

  // Send email
  sendEmail: (data: {
    to: string;
    subject: string;
    message: string;
    contactId?: string;
    replyTo?: string;
  }) => api.post('/emails/send', data),

  // Save draft
  saveDraft: (data: {
    to?: string;
    subject?: string;
    message?: string;
    contactId?: string;
    replyTo?: string;
    draftId?: string;
  }) => api.post('/emails/draft', data),

  // Toggle read status
  toggleRead: (id: string, isRead: boolean) =>
    api.put(`/emails/${id}/read`, { isRead }),

  // Toggle star
  toggleStar: (id: string) => api.put(`/emails/${id}/star`),

  // Move to folder
  moveEmail: (id: string, folder: string) =>
    api.put(`/emails/${id}/move`, { folder }),

  // Delete email
  deleteEmail: (id: string) => api.delete(`/emails/${id}`),

  // Bulk operations
  bulkOperation: (data: {
    ids: string[];
    operation: 'markRead' | 'markUnread' | 'star' | 'unstar' | 'move' | 'delete';
    value?: string;
  }) => api.post('/emails/bulk', data),
};

// Calendar endpoints
export const calendarAPI = {
  // Get all events
  getEvents: (params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
    status?: string;
    priority?: string;
    assignedTo?: string;
    page?: number;
    limit?: number;
  }) => api.get('/calendar/events', { params }),

  // Get single event
  getEvent: (id: string) => api.get(`/calendar/events/${id}`),

  // Create event
  createEvent: (data: any) => api.post('/calendar/events', data),

  // Update event
  updateEvent: (id: string, data: any) => api.put(`/calendar/events/${id}`, data),

  // Delete event
  deleteEvent: (id: string) => api.delete(`/calendar/events/${id}`),

  // Update status
  updateStatus: (id: string, status: string) =>
    api.put(`/calendar/events/${id}/status`, { status }),

  // Snooze event
  snoozeEvent: (id: string, minutes: number) =>
    api.post(`/calendar/events/${id}/snooze`, { minutes }),

  // Get today's events
  getTodayEvents: () => api.get('/calendar/events/today'),

  // Get overdue events
  getOverdueEvents: () => api.get('/calendar/events/overdue'),

  // Get upcoming events
  getUpcomingEvents: (days?: number) =>
    api.get('/calendar/events/upcoming', { params: { days } }),

  // Update task status
  updateTaskStatus: (eventId: string, taskId: string, completed: boolean) =>
    api.put(`/calendar/events/${eventId}/tasks/${taskId}`, { completed }),
};

// Notification endpoints
export const notificationsAPI = {
  // Get all notifications
  getNotifications: (params?: {
    isRead?: boolean;
    type?: string;
    page?: number;
    limit?: number;
  }) => api.get('/notifications', { params }),

  // Get unread count
  getUnreadCount: () => api.get('/notifications/unread/count'),

  // Get recent notifications
  getRecent: (limit?: number) =>
    api.get('/notifications/recent', { params: { limit } }),

  // Mark as read
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),

  // Mark all as read
  markAllAsRead: () => api.put('/notifications/read-all'),

  // Delete notification
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),

  // Delete all read
  deleteAllRead: () => api.delete('/notifications/read'),

  // Mark sound as played
  markSoundPlayed: (id: string) => api.put(`/notifications/${id}/sound-played`),

  // Create notification
  createNotification: (data: any) => api.post('/notifications', data),
};

// Blog endpoints
export const blogAPI = {
  // Get all blogs
  getBlogs: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
    featured?: boolean;
  }) => api.get('/blogs', { params }),

  // Get single blog
  getBlog: (id: string) => api.get(`/blogs/${id}`),

  // Get blog by slug
  getBlogBySlug: (slug: string) => api.get(`/blogs/slug/${slug}`),

  // Create blog
  createBlog: (data: any) => api.post('/blogs', data),

  // Update blog
  updateBlog: (id: string, data: any) => api.put(`/blogs/${id}`, data),

  // Delete blog
  deleteBlog: (id: string) => api.delete(`/blogs/${id}`),

  // Add comment
  addComment: (id: string, data: { author: string; email: string; content: string }) =>
    api.post(`/blogs/${id}/comments`, data),

  // Get blog stats
  getBlogStats: () => api.get('/blogs/stats/overview'),
};

// Company Info endpoints
export const companyInfoAPI = {
  get: () => api.get('/company-info'),
  update: (data: any) => api.put('/company-info', data),
};

// Dashboard endpoint
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
};

// Project endpoints
export const projectAPI = {
  getProjects: (params?: any) => api.get('/projects', { params }),
  getProject: (id: string) => api.get(`/projects/${id}`),
  createProject: (data: any) => api.post('/projects', data),
  updateProject: (id: string, data: any) => api.put(`/projects/${id}`, data),
  deleteProject: (id: string) => api.delete(`/projects/${id}`),
  updateStatus: (id: string, data: { status?: string; progressPercent?: number }) =>
    api.patch(`/projects/${id}/status`, data),
  assignUsers: (id: string, data: { assignedUsers: string[]; projectManagerId?: string }) =>
    api.patch(`/projects/${id}/assign-users`, data),
  togglePublish: (id: string) => api.patch(`/projects/${id}/publish`, {}),
  getUpdates: (id: string) => api.get(`/projects/${id}/updates`),
  addUpdate: (id: string, data: { title: string; description?: string; type?: string }) =>
    api.post(`/projects/${id}/updates`, data),
  editUpdate: (id: string, updateId: string, data: any) =>
    api.put(`/projects/${id}/updates/${updateId}`, data),
  deleteUpdate: (id: string, updateId: string) =>
    api.delete(`/projects/${id}/updates/${updateId}`),
  seedDemo: () => api.post('/projects/seed-demo', {}),
};

// Testimonial endpoints
export const testimonialAPI = {
  getAll: (params?: { active?: string; satisfiedOnly?: string }) => api.get('/testimonials', { params }),
  getOne: (id: string) => api.get(`/testimonials/${id}`),
  create: (data: any) => api.post('/testimonials', data),
  update: (id: string, data: any) => api.put(`/testimonials/${id}`, data),
  remove: (id: string) => api.delete(`/testimonials/${id}`),
};

// Partner endpoints
export const partnerAPI = {
  getAll: (params?: { active?: string }) => api.get('/partners', { params }),
  getOne: (id: string) => api.get(`/partners/${id}`),
  create: (data: any) => api.post('/partners', data),
  update: (id: string, data: any) => api.put(`/partners/${id}`, data),
  remove: (id: string) => api.delete(`/partners/${id}`),
};

// Team endpoints
export const teamAPI = {
  getAll: (params?: { limit?: number; active?: string }) => api.get('/team', { params }),
  getOne: (id: string) => api.get(`/team/${id}`),
  create: (data: any) => api.post('/team', data),
  update: (id: string, data: any) => api.put(`/team/${id}`, data),
  remove: (id: string) => api.delete(`/team/${id}`),
};

// Billing endpoints
export const billingAPI = {
  getAll: (params?: { type?: string; status?: string; page?: number; limit?: number }) =>
    api.get('/billing', { params }),
  getOne: (id: string) => api.get(`/billing/${id}`),
  create: (data: any) => api.post('/billing', data),
  update: (id: string, data: any) => api.put(`/billing/${id}`, data),
  remove: (id: string) => api.delete(`/billing/${id}`),
  convert: (id: string) => api.post(`/billing/${id}/convert`, {}),
  markPaid: (id: string, paymentDate?: string) =>
    api.post(`/billing/${id}/mark-paid`, { paymentDate }),
  sendEmail: (id: string, data: { to: string; message: string }) =>
    api.post(`/billing/${id}/send-email`, data),
  addPayment: (id: string, data: { amount: number; method: string; note?: string; date?: string }) =>
    api.post(`/billing/${id}/add-payment`, data),
};

export default api;
