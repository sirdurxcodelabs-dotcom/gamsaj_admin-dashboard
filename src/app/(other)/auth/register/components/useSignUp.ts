import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import * as yup from 'yup'
import { useNotificationContext } from '@/context/useNotificationContext'
import { authAPI } from '@/services/api'
import api from '@/services/api'

const useSignUp = () => {
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<{ _id: string; name: string }[]>([])
  const navigate = useNavigate()
  const { showNotification } = useNotificationContext()

  // Fetch available roles on mount — uses public endpoint (no auth needed)
  useEffect(() => {
    api.get('/roles/public').then(res => {
      const data = res.data.data || res.data.roles || []
      setRoles(data.filter((r: any) => r.isActive))
    }).catch(() => {})
  }, [])

  const signUpSchema = yup.object({
    name: yup.string().required('Please enter your name'),
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Please enter your password'),
    roleId: yup.string().required('Please select a role'),
  })

  const { control, handleSubmit, register: rhfRegister } = useForm({
    resolver: yupResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '', roleId: '' },
  })

  type SignUpFormFields = yup.InferType<typeof signUpSchema>

  const register = handleSubmit(async (values: SignUpFormFields) => {
    setLoading(true)
    try {
      const res = await authAPI.register(values.name, values.email, values.password, values.roleId)
      if (res.data.success) {
        showNotification({ message: 'Account created successfully!', variant: 'success' })
        setTimeout(() => navigate('/auth/login'), 1500)
      }
    } catch (e: any) {
      showNotification({ message: e.response?.data?.message || 'Registration failed.', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  })

  return { loading, register, control, rhfRegister, roles }
}

export default useSignUp
