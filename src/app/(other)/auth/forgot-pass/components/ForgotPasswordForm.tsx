import { useState } from 'react'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import { Alert, Button, Spinner } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { authAPI } from '@/services/api'

const schema = yup.object({ email: yup.string().email('Please enter a valid email').required('Email is required') })

const ForgotPasswordForm = () => {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const { control, handleSubmit } = useForm({ resolver: yupResolver(schema) })

  const onSubmit = async ({ email }: { email: string }) => {
    try {
      setLoading(true)
      setError('')
      const res = await authAPI.forgotPassword(email)
      if (res.data.success) setSuccess(true)
      else setError(res.data.message || 'Something went wrong')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Alert variant="success" className="text-start">
        <IconifyIcon icon="mdi:email-check" className="me-2 fs-18" />
        <strong>Check your inbox.</strong>
        <p className="mb-0 mt-1 text-muted" style={{ fontSize: 14 }}>
          A password reset link has been sent to your email. It expires in 10 minutes.
        </p>
      </Alert>
    )
  }

  return (
    <form className="text-start" onSubmit={handleSubmit(onSubmit)}>
      {error && <Alert variant="danger" className="py-2">{error}</Alert>}
      <TextFormInput control={control} name="email" containerClassName="mb-3" label="Email address" id="email-id" placeholder="Enter your email" />
      <div className="mb-0 text-start">
        <Button variant="soft-primary" className="w-100" type="submit" disabled={loading}>
          {loading
            ? <><Spinner size="sm" className="me-1" />Sending...</>
            : <><IconifyIcon icon="ri:loop-left-line" className="me-1 fw-bold" /><span className="fw-bold">Reset Password</span></>}
        </Button>
      </div>
    </form>
  )
}

export default ForgotPasswordForm
