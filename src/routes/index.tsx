import  { lazy } from 'react'
import { RouteProps } from 'react-router-dom'


// auth
const Login = lazy(() => import('@/app/(other)/auth/login/page'))
const Register = lazy(() => import('@/app/(other)/auth/register/page'))
const Logout = lazy(() => import('@/app/(other)/auth/logout/page'))
const ForgotPassword = lazy(() => import('@/app/(other)/auth/forgot-pass/page'))
const LockScreen = lazy(() => import('@/app/(other)/auth/lock-screen/page'))
const ResetPassword = lazy(() => import('@/app/(other)/auth/reset-password/page'))

// dashboard
const Dashboard = lazy(() => import('@/app/(admin)/dashboard/page'))

//apps
const Calendar = lazy(() => import('@/app/(admin)/apps/calendar/page'))
const Email = lazy(() => import('@/app/(admin)/apps/email/page'))
const EmailCompose = lazy(() => import('@/app/(admin)/apps/email/compose/page'))

// content
const ProjectsPage = lazy(() => import('@/app/(admin)/content/projects/page'))
const BlogsPage = lazy(() => import('@/app/(admin)/content/blogs/page'))
const CompanyInfoPage = lazy(() => import('@/app/(admin)/content/company-info/page'))

// pages
const ProfilePages = lazy(() => import('@/app/(admin)/pages/profile/page'))
const InvoiceReport = lazy(() => import('@/app/(admin)/apps/invoices/report/page'))
const InvoiceList = lazy(() => import('@/app/(admin)/pages/starter/page')) // Placeholder
const InvoiceDetail = lazy(() => import('@/app/(admin)/apps/invoices/[invoiceId]/page'))
const MaintenancePages = lazy(() => import('@/app/(other)/maintenance/page'))
const StarterPages = lazy(() => import('@/app/(admin)/pages/starter/page'))

// admin
const UsersPage = lazy(() => import('@/app/(admin)/admin/users/page'))
const RolesPage = lazy(() => import('@/app/(admin)/admin/roles/page'))
const PermissionsPage = lazy(() => import('@/app/(admin)/admin/permissions/page'))
const RoleMatrixPage = lazy(() => import('@/app/(admin)/admin/role-matrix/page'))
const ConnectionsPage = lazy(() => import('@/app/(admin)/admin/connections/page'))

// error
const Error404 = lazy(() => import('@/app/(other)/(error-pages)/error-404/page'))
const Error404Alt = lazy(() => import('@/app/(admin)/pages/error-404-alt/page'))

export type RoutesProps = {
  path: RouteProps['path']
  name: string
  element: RouteProps['element']
  exact?: boolean
}

// dashboards
const generalRoutes: RoutesProps[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    element: <Dashboard />,
  },
]

const appsRoutes: RoutesProps[] = [
  {
    path: '/apps/calendar',
    name: 'Calendar',
    element: <Calendar />,
  },
  {
    path: '/apps/email',
    name: 'Email',
    element: <Email />,
  },
  {
    path: '/apps/email/compose',
    name: 'Compose Email',
    element: <EmailCompose />,
  },
  {
    path: '/apps/invoices/report',
    name: 'Invoice Report',
    element: <InvoiceReport />,
  },
  {
    path: '/apps/invoices',
    name: 'Invoice List',
    element: <InvoiceList />,
  },
  {
    name: 'Invoice Details',
    path: '/apps/invoices/:invoiceId',
    element: <InvoiceDetail/>,
  },
]

// content routes
const contentRoutes: RoutesProps[] = [
  {
    path: '/content/projects',
    name: 'Projects',
    element: <ProjectsPage />,
  },
  {
    path: '/content/blogs',
    name: 'Blogs',
    element: <BlogsPage />,
  },
  {
    path: '/content/company-info',
    name: 'Company Information',
    element: <CompanyInfoPage />,
  },
]

// pages
const customPagesRoutes: RoutesProps[] = [
  {
    path: '/pages/profile',
    name: 'Profile',
    element: <ProfilePages />,
  },
  {
    path: '/pages/starter',
    name: 'Starter Page',
    element: <StarterPages />,
  },
  {
    path: 'pages/error-404-alt',
    name: 'Error - 404-alt',
    element: <Error404Alt />,
  },
]

// admin
const adminRoutes: RoutesProps[] = [
  {
    path: '/admin/users',
    name: 'Users',
    element: <UsersPage />,
  },
  {
    path: '/admin/roles',
    name: 'Roles',
    element: <RolesPage />,
  },
  {
    path: '/admin/permissions',
    name: 'Permissions',
    element: <PermissionsPage />,
  },
  {
    path: '/admin/role-matrix',
    name: 'Role Permission Matrix',
    element: <RoleMatrixPage />,
  },
  {
    path: '/admin/connections',
    name: 'Connections',
    element: <ConnectionsPage />,
  },
]

// auth
const authRoutes: RoutesProps[] = [
  {
    path: '/auth/login',
    name: 'Login',
    element: <Login />,
  },
  {
    path: '/auth/register',
    name: 'Register',
    element: <Register />,
  },
  {
    path: '/auth/logout',
    name: 'Logout',
    element: <Logout />,
  },
  {
    path: '/auth/forgot-password',
    name: 'Forgot Password',
    element: <ForgotPassword />,
  },
  {
    path: '/auth/reset-password/:token',
    name: 'Reset Password',
    element: <ResetPassword />,
  },
  {
    path: '/auth/lock-screen',
    name: 'Lock Screen',
    element: <LockScreen />,
  },
]

// public routes
const otherPublicRoutes:RoutesProps[] = [
  {
    path: '/maintenance',
    name: 'Maintenance',
    element: <MaintenancePages />,
  },
  {
    path: '/error-404',
    name: 'Error - 404',
    element: <Error404 />,
  },
  {
    path: '*',
    name: 'Error - 404',
    element: <Error404 />,
  },
]

export const appRoutes = [
  ...generalRoutes,
  ...customPagesRoutes,
  ...appsRoutes,
  ...contentRoutes,
  ...adminRoutes,
]

export const publicRoutes = [...authRoutes, ...otherPublicRoutes]
