import { Link } from 'react-router-dom'
import { AuthenticationLayout } from '../components/AuthenticationLayout'
import { RegistrationForm } from '../components/RegistrationForm'

export default function RegisterPage() {
  return (
    <AuthenticationLayout title="Create Your Account" subtitle="Sign up to start organizing your notes and ideas."
      footer={<>Already have an account? <Link to="/login" className="font-medium text-n-950 underline">Login</Link></>}>
      <RegistrationForm />
    </AuthenticationLayout>
  )
}
