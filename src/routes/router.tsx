import { Navigate, Route, Routes, type RouteProps } from 'react-router-dom'

import { useAuthContext } from '@/context/useAuthContext'
import { appRoutes, publicRoutes } from '@/routes/index'
import AdminLayout from '@/layouts/AdminLayout'
import OtherLayout from '@/layouts/OtherLayout'

const AppRouter = (props: RouteProps) => {
  const { isAuthenticated, user } = useAuthContext()

  // Debug logging
  console.log('🔐 Auth Status:', { isAuthenticated, user })

  return (
    <Routes>
      {/* Root route - redirect based on authentication */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/auth/login" replace />
          )
        } 
      />

      {publicRoutes.map((route, idx) => (
        <Route key={idx + route.name} path={route.path} element={<OtherLayout {...props}>{route.element}</OtherLayout>} />
      ))}

      {(appRoutes || []).map((route, idx) => (
        <Route
          key={idx + route.name}
          path={route.path}
          element={
            isAuthenticated ? (
              <AdminLayout {...props}>{route.element}</AdminLayout>
            ) : (
              <Navigate
                to={{
                  pathname: '/auth/login',
                  search: 'redirectTo=' + route.path,
                }}
              />
            )
          }
        />
      ))}
    </Routes>
  )
}

export default AppRouter
