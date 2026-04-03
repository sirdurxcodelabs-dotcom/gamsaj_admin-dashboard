
import FallbackLoading from '@/components/FallbackLoading'
import { currentYear } from '@/context/constants'
import type { ChildrenType } from '@/types/component-props'
import { Suspense, useEffect } from 'react'

const OtherLayout = ({ children }: ChildrenType) => {
  useEffect(() => {
    // Remove old auth bg class — our pages handle their own background
    document.body.classList.remove('authentication-bg')
    document.body.style.height = ''
    document.body.style.background = 'transparent'
    return () => {
      document.body.style.background = ''
    }
  }, [])

  return (
    <Suspense fallback={<FallbackLoading />}>
      {children}
    </Suspense>
  )
}
export default OtherLayout
