import { yupResolver } from '@hookform/resolvers/yup'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import * as yup from 'yup'

import { useNotificationContext } from '@/context/useNotificationContext'
import { authAPI } from '@/services/api'

const useSignUp = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { showNotification } = useNotificationContext()

  const signUpSchema = yup.object({
    name: yup.string().required('Please enter your name'),
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Please enter your password'),
  })

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  type SignUpFormFields = yup.InferType<typeof signUpSchema>

  const register = handleSubmit(async (values: SignUpFormFields) => {
    setLoading(true)
    try {
      const res = await authAPI.register(values.name, values.email, values.password)
      
      if (res.data.success) {
        showNotification({ 
          message: 'Registration successful! Please check your email for verification.', 
          variant: 'success' 
        })
        setTimeout(() => {
          navigate('/auth/login')
        }, 2000)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      const errorMessage = e.response?.data?.message || 'Registration failed. Please try again.'
      showNotification({ message: errorMessage, variant: 'danger' })
    } finally {
      setLoading(false)
    }
  })

  return { loading, register, control }
}

export default useSignUp
