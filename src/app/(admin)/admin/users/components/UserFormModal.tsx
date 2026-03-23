import { useState, useEffect } from 'react'
import { Modal, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap'
import { userAPI, roleAPI } from '@/services/api'

interface Role { _id: string; name: string; slug: string; isActive: boolean }
interface User {
  _id?: string; name: string; email: string; role?: { _id: string; name: string } | null
  isActive?: boolean; isVerified?: boolean; permissions?: string[]
}

interface Props { show: boolean; onHide: () => void; user: User | null; onSuccess: () => void }

const UserFormModal = ({ show, onHide, user, onSuccess }: Props) => {
  const isEdit = !!user?._id
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])
  const [rolesLoading, setRolesLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '', roleId: '' })

  useEffect(() => {
    if (show) {
      setError('')
      fetchRoles()
      if (user) {
        setForm({ name: user.name, email: user.email, password: '', roleId: user.role?._id || '' })
      } else {
        setForm({ name: '', email: '', password: '', roleId: '' })
      }
    }
  }, [show, user])

  const fetchRoles = async () => {
    try {
      setRolesLoading(true)
      const res = await roleAPI.getRoles()
      if (res.data.success) {
        setRoles(res.data.data.filter((r: Role) => r.isActive))
      }
    } catch {
      setError('Failed to load roles from server.')
    } finally {
      setRolesLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.roleId) { setError('Please select a role.'); return }
    if (!isEdit && !form.password) { setError('Password is required for new users.'); return }

    // Validate role exists in fetched list
    const roleExists = roles.find(r => r._id === form.roleId)
    if (!roleExists) { setError('Selected role does not exist in the database. Please choose a valid role.'); return }

    try {
      setLoading(true)
      const payload: any = { name: form.name, email: form.email, roleId: form.roleId }
      if (!isEdit || form.password) payload.password = form.password

      const res = isEdit
        ? await userAPI.updateUser(user!._id!, payload)
        : await userAPI.createUser(payload)

      if (res.data.success) {
        onSuccess()
        onHide()
      } else {
        setError(res.data.message || 'Operation failed')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? 'Edit User' : 'Create User'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger" className="py-2">{error}</Alert>}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
                <Form.Control name="name" value={form.name} onChange={handleChange} required placeholder="Enter full name" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required placeholder="Enter email" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Password {!isEdit && <span className="text-danger">*</span>}</Form.Label>
                <Form.Control type="password" name="password" value={form.password} onChange={handleChange}
                  placeholder={isEdit ? 'Leave blank to keep current' : 'Enter password'} minLength={6} />
                {isEdit && <Form.Text className="text-muted">Leave blank to keep current password</Form.Text>}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Role <span className="text-danger">*</span></Form.Label>
                {rolesLoading ? (
                  <div className="d-flex align-items-center gap-2 py-2">
                    <Spinner size="sm" /> <small>Loading roles...</small>
                  </div>
                ) : (
                  <Form.Select name="roleId" value={form.roleId} onChange={handleChange} required>
                    <option value="">-- Select Role --</option>
                    {roles.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                  </Form.Select>
                )}
                {roles.length === 0 && !rolesLoading && (
                  <Form.Text className="text-danger">No roles available. Please seed roles first.</Form.Text>
                )}
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={loading || rolesLoading}>
            {loading ? <><Spinner size="sm" className="me-1" />Saving...</> : isEdit ? 'Update User' : 'Create User'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default UserFormModal
