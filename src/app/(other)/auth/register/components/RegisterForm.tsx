import TextFormInput from '@/components/form/TextFormInput'
import PasswordFormInput from '@/components/form/PasswordFormInput'
import { Button, Form } from 'react-bootstrap'
import useSignUp from './useSignUp'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

const RegisterForm = () => {
  const { control, rhfRegister, loading, register, roles } = useSignUp()

  return (
    <form onSubmit={register} className="text-start">
      <TextFormInput
        control={control}
        name="name"
        containerClassName="mb-3"
        label="Full Name"
        id="name"
        placeholder="Enter your full name"
      />
      <TextFormInput
        control={control}
        name="email"
        containerClassName="mb-3"
        label="Email Address"
        id="email-id"
        placeholder="Enter your email"
      />
      <PasswordFormInput
        control={control}
        name="password"
        containerClassName="mb-3"
        placeholder="Min. 6 characters"
        id="password-id"
        label="Password"
      />
      <Form.Group className="mb-3">
        <Form.Label>Role</Form.Label>
        <Form.Select {...rhfRegister('roleId')} defaultValue="">
          <option value="" disabled>— Select a role —</option>
          {roles.map(r => (
            <option key={r._id} value={r._id}>{r.name}</option>
          ))}
        </Form.Select>
        {roles.length === 0 && (
          <Form.Text className="text-muted">Loading roles...</Form.Text>
        )}
      </Form.Group>
      <Button className="btn-auth btn mt-1" disabled={loading} type="submit">
        <IconifyIcon icon="ri:user-add-fill" className="me-2" />
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  )
}

export default RegisterForm
