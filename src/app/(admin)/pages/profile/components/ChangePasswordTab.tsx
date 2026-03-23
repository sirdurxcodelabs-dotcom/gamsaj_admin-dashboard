import { useState } from 'react'
import { Button, Col, Form, ProgressBar, Row } from 'react-bootstrap'
import { ChangePasswordData } from '@/types/auth'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

type ChangePasswordTabProps = {
  onChangePassword: (data: ChangePasswordData) => Promise<{ success: boolean; message: string }>
  updating: boolean
}

const ChangePasswordTab = ({ onChangePassword, updating }: ChangePasswordTabProps) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 6) strength += 25
    if (password.length >= 8) strength += 25
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25
    if (/\d/.test(password)) strength += 15
    if (/[^a-zA-Z\d]/.test(password)) strength += 10
    return Math.min(strength, 100)
  }

  const getPasswordStrengthLabel = (strength: number) => {
    if (strength < 25) return { label: 'Weak', variant: 'danger' }
    if (strength < 50) return { label: 'Fair', variant: 'warning' }
    if (strength < 75) return { label: 'Good', variant: 'info' }
    return { label: 'Strong', variant: 'success' }
  }

  const passwordStrength = getPasswordStrength(formData.newPassword)
  const strengthInfo = getPasswordStrengthLabel(passwordStrength)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    const result = await onChangePassword({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    })

    if (result.success) {
      // Reset form on success
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    }
  }

  return (
    <div className="user-profile-content">
      <div className="alert alert-warning mb-4">
        <IconifyIcon icon="mdi:shield-lock" className="me-2" />
        <strong>Security Tip:</strong> Use a strong password with a mix of uppercase, lowercase, numbers, and special
        characters.
      </div>

      <Form onSubmit={handleSubmit}>
        <Row className="g-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>
                Current Password <span className="text-danger">*</span>
              </Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => handleChange('currentPassword', e.target.value)}
                  isInvalid={!!errors.currentPassword}
                  placeholder="Enter your current password"
                />
                <Button
                  variant="link"
                  className="position-absolute end-0 top-0 text-muted"
                  onClick={() => togglePasswordVisibility('current')}
                  type="button"
                >
                  <IconifyIcon icon={showPasswords.current ? 'mdi:eye-off' : 'mdi:eye'} />
                </Button>
                <Form.Control.Feedback type="invalid">{errors.currentPassword}</Form.Control.Feedback>
              </div>
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group>
              <Form.Label>
                New Password <span className="text-danger">*</span>
              </Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => handleChange('newPassword', e.target.value)}
                  isInvalid={!!errors.newPassword}
                  placeholder="Enter your new password (min 6 characters)"
                />
                <Button
                  variant="link"
                  className="position-absolute end-0 top-0 text-muted"
                  onClick={() => togglePasswordVisibility('new')}
                  type="button"
                >
                  <IconifyIcon icon={showPasswords.new ? 'mdi:eye-off' : 'mdi:eye'} />
                </Button>
                <Form.Control.Feedback type="invalid">{errors.newPassword}</Form.Control.Feedback>
              </div>
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="d-flex justify-content-between mb-1">
                    <small className="text-muted">Password Strength:</small>
                    <small className={`text-${strengthInfo.variant}`}>{strengthInfo.label}</small>
                  </div>
                  <ProgressBar now={passwordStrength} variant={strengthInfo.variant} style={{ height: '6px' }} />
                </div>
              )}
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group>
              <Form.Label>
                Confirm New Password <span className="text-danger">*</span>
              </Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  isInvalid={!!errors.confirmPassword}
                  placeholder="Confirm your new password"
                />
                <Button
                  variant="link"
                  className="position-absolute end-0 top-0 text-muted"
                  onClick={() => togglePasswordVisibility('confirm')}
                  type="button"
                >
                  <IconifyIcon icon={showPasswords.confirm ? 'mdi:eye-off' : 'mdi:eye'} />
                </Button>
                <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
              </div>
            </Form.Group>
          </Col>
        </Row>

        <div className="mt-4">
          <Button variant="primary" type="submit" disabled={updating}>
            <IconifyIcon icon="mdi:lock-reset" className="me-1 fs-16 lh-1" />
            {updating ? 'Changing Password...' : 'Change Password'}
          </Button>
        </div>
      </Form>
    </div>
  )
}

export default ChangePasswordTab
