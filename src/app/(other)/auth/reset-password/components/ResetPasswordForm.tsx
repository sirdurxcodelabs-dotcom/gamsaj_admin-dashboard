import { useState } from 'react'
import { Alert, Button, Form, Spinner } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { authAPI } from '@/services/api'

const ResetPasswordForm = () => {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [show, setShow] = useState({ password: false, confirm: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (!token) { setError('Invalid or missing reset token.'); return }

    try {
      setLoading(true)
      const res = await authAPI.resetPassword(token, form.password)
      if (res.data.success) {
        setSuccess(true)
        setTimeout(() => navigate('/auth/login'), 3000)
      } else {
        setError(res.data.message || 'Reset failed')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired reset link. Please request a new one.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Alert variant="success">
        <IconifyIcon icon="mdi:check-circle" className="me-2 fs-18" />
        <strong>Password reset successful.</strong>
        <p className="mb-0 mt-1 text-muted" style={{ fontSize: 14 }}>Redirecting to login...</p>
      </Alert>
    )
  }

  return (
    <form className="text-start" onSubmit={handleSubmit}>
      {error && <Alert variant="danger" className="py-2">{error}</Alert>}

      <Form.Group className="mb-3">
        <Form.Label>New Password <span className="text-danger">*</span></Form.Label>
        <div className="position-relative">
          <Form.Control
            type={show.password ? 'text' : 'password'}
            value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            placeholder="Min 6 characters"
            required
          />
          <Button variant="link" type="button" className="position-absolute end-0 top-0 text-muted"
            onClick={() => setShow(s => ({ ...s, password: !s.password }))}>
            <IconifyIcon icon={show.password ? 'mdi:eye-off' : 'mdi:eye'} />
          </Button>
        </div>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Confirm Password <span className="text-danger">*</span></Form.Label>
        <div className="position-relative">
          <Form.Control
            type={show.confirm ? 'text' : 'password'}
            value={form.confirm}
            onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
            placeholder="Repeat new password"
            required
          />
          <Button variant="link" type="button" className="position-absolute end-0 top-0 text-muted"
            onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}>
            <IconifyIcon icon={show.confirm ? 'mdi:eye-off' : 'mdi:eye'} />
          </Button>
        </div>
      </Form.Group>

      <Button variant="primary" type="submit" className="w-100" disabled={loading}>
        {loading ? <><Spinner size="sm" className="me-1" />Resetting...</> : 'Set New Password'}
      </Button>
    </form>
  )
}

export default ResetPasswordForm
