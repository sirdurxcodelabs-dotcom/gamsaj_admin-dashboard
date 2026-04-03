

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Link } from 'react-router-dom'
import TextFormInput from '@/components/form/TextFormInput'
import useSignIn from './useSignIn'
import PasswordFormInput from '@/components/form/PasswordFormInput'
import { Button, FormCheck } from 'react-bootstrap'
import { Fragment } from 'react'

const LoginForm = () => {
  const { control, loading, login } = useSignIn()
  return (
    <form onSubmit={login} className="text-start">
      <TextFormInput control={control} name="email" containerClassName="mb-3" label="Email address" id="email-id" placeholder="Enter your email" />
      <PasswordFormInput
        control={control}
        name="password"
        containerClassName="mb-3"
        placeholder="Enter your password"
        id="password-id"
        label={
          <Fragment>
            <Link to="/auth/forgot-password" className="float-end auth-link" style={{ fontSize: 12 }}>
              Forgot password?
            </Link>
            <label htmlFor="password-id" className="form-label">Password</label>
          </Fragment>
        }
      />
      <div className="mb-3">
        <FormCheck label="Remember me" id="sign-in" />
      </div>
      <div className="mb-0">
        <Button className="btn-auth btn w-100" disabled={loading} type="submit">
          <IconifyIcon icon="ri:login-circle-fill" className="me-1" />
          <span className="fw-bold">{loading ? 'Signing in...' : 'Sign In'}</span>
        </Button>
      </div>
    </form>
  )
}
export default LoginForm
