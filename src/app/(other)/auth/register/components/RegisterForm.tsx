
import ThirdPartyLogin from '@/components/ThirdPartyLogin'
import TextFormInput from '@/components/form/TextFormInput'
import PasswordFormInput from '@/components/form/PasswordFormInput'
import { Button, FormCheck } from 'react-bootstrap'
import useSignUp from './useSignUp'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

const RegisterForm = () => {
  const { control, register, loading } = useSignUp()
  
  return (
    <form onSubmit={register} className="text-start">
      <TextFormInput 
        control={control} 
        name="name" 
        containerClassName="mb-3" 
        label="Full Name" 
        id="name" 
        placeholder="Enter your name" 
      />
      <TextFormInput 
        control={control} 
        name="email" 
        containerClassName="mb-3" 
        label="Email address" 
        id="email-id" 
        placeholder="Enter your email" 
      />
      <PasswordFormInput
        control={control}
        name="password"
        containerClassName="mb-3"
        placeholder="Enter your password"
        id="password-id"
        label="Password"
      />
      <div className="mb-3">
        <FormCheck label="I accept Terms and Condition" id="termAndCondition2" />
      </div>
      <div className="mb-0 text-start">
        <Button variant="soft-primary" disabled={loading} className="w-100" type="submit">
          <IconifyIcon icon="ri:user-add-fill" className="me-1" /> 
          <span className="fw-bold">{loading ? 'Signing Up...' : 'Sign Up'}</span>
        </Button>
      </div>
      <ThirdPartyLogin />
    </form>
  )
}
export default RegisterForm
