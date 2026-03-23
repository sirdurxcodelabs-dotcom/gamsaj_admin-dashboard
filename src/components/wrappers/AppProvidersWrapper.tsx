
import { AuthProvider } from '@/context/useAuthContext'
import { LayoutProvider } from '@/context/useLayoutContext'
import { NotificationProvider } from '@/context/useNotificationContext'
import { TitleProvider } from '@/context/useTitleContext'
import type { ChildrenType } from '@/types/component-props'
import { HelmetProvider } from 'react-helmet-async'

const AppProvidersWrapper = ({ children }: ChildrenType) => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <LayoutProvider>
          <TitleProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </TitleProvider>
        </LayoutProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}
export default AppProvidersWrapper
