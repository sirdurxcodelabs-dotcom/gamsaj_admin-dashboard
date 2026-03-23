import { lazy, Suspense, useEffect, useRef } from 'react'
import LogoBox from '@/components/LogoBox'
import SimplebarReactClient from '@/components/wrappers/SimplebarReactClient'
const AppMenu = lazy(() => import('./components/AppMenu'))
import FallbackLoading from '@/components/FallbackLoading'
import { getMenuItems } from '@/helpers/menu'

const VerticalNavigationBar = () => {
  const menuItems = getMenuItems()
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = document.querySelector('#leftside-menu-container .simplebar-content-wrapper')
      const sidebar = sidebarRef.current
      
      if (scrollContainer && sidebar) {
        if (scrollContainer.scrollTop > 20) {
          sidebar.classList.add('scrolled')
        } else {
          sidebar.classList.remove('scrolled')
        }
      }
    }

    const scrollContainer = document.querySelector('#leftside-menu-container .simplebar-content-wrapper')
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll)
      return () => scrollContainer.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="leftside-menu" id="leftside-menu-container" ref={sidebarRef}>
      <LogoBox />

      <SimplebarReactClient data-simplebar>
        <Suspense fallback={<FallbackLoading />}>
          <AppMenu menuItems={menuItems} />
        </Suspense>
      </SimplebarReactClient>
    </div>
  )
}
export default VerticalNavigationBar
