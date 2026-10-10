import { Link } from 'react-router-dom'
import { AuthenticationLayout } from '../components/AuthenticationLayout'
import { LoginForm } from '../components/LoginForm'

export default function LoginPage() {
  return (
    <AuthenticationLayout title="Welcome to Notes" subtitle="Please log in to continue"
      footer={<>No account yet? <Link to="/register" className="font-medium text-n-950 underline">Sign Up</Link></>}>
      <LoginForm />
    </AuthenticationLayout>
  )
}
