import { useEffect, useState } from 'react'
import { Toast, ToastContainer } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

interface ToastMsg { id: number; text: string; variant: 'success' | 'danger' | 'warning' }

let _push: ((msg: Omit<ToastMsg, 'id'>) => void) | null = null

export const showToast = (text: string, variant: ToastMsg['variant'] = 'success') => {
  _push?.({ text, variant })
}

const ICONS = { success: 'ri:check-circle-line', danger: 'ri:error-warning-line', warning: 'ri:alert-line' }

export const BillingToastProvider = () => {
  const [toasts, setToasts] = useState<ToastMsg[]>([])

  useEffect(() => {
    _push = (msg) => setToasts(p => [...p, { ...msg, id: Date.now() }])
    return () => { _push = null }
  }, [])

  const remove = (id: number) => setToasts(p => p.filter(t => t.id !== id))

  return (
    <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 9999 }}>
      {toasts.map(t => (
        <Toast key={t.id} bg={t.variant} onClose={() => remove(t.id)} delay={4000} autohide>
          <Toast.Body className="text-white d-flex align-items-center gap-2">
            <IconifyIcon icon={ICONS[t.variant]} />
            {t.text}
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  )
}
