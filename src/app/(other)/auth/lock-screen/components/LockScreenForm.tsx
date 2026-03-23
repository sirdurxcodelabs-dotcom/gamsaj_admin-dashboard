import PasswordFormInput from '@/components/form/PasswordFormInput'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useAuthContext } from '@/context/useAuthContext'
import { useNotificationContext } from '@/context/useNotificationContext'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import * as yup from 'yup'

const LockScreenForm = () => {
  const { unlockSession } = useAuthContext()
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)

  const lockScreenSchema = yup.object({
    password: yup.string().required('Please enter your password'),
  })

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(lockScreenSchema),
  })

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true)
    try {
      const success = await unlockSession(values.password)
      
      if (success) {
        showNotification({ 
          message: 'Welcome back! Unlocking...', 
          variant: 'success' 
        })
      } else {
        showNotification({ 
          message: 'Incorrect password. Please try again.', 
          variant: 'danger' 
        })
      }
    } catch (error) {
      showNotification({ 
        message: 'An error occurred. Please try again.', 
        variant: 'danger' 
      })
    } finally {
      setLoading(false)
    }
  })

  return (
    <form onSubmit={onSubmit}>
      <PasswordFormInput
        control={control}
        label="Password"
        name="password"
        containerClassName="mb-3"
        placeholder="Enter your password"
        id="password-id"
      />
      <div className="mb-0 text-start">
        <Button variant="soft-primary" className="w-100" type="submit" disabled={loading}>
          <IconifyIcon icon="ri:lock-unlock-line" className="me-1" /> 
          <span className="fw-bold">{loading ? 'Unlocking...' : 'Unlock'}</span>
        </Button>
      </div>
    </form>
  )
}
export default LockScreenForm
