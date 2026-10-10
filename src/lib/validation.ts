const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const validateEmail = (v: string) =>
  !v.trim() ? 'Email is required' : EMAIL.test(v.trim()) ? '' : 'Please enter a valid email address'
export const validatePassword = (v: string, strict: boolean) =>
  !v ? 'Password is required' : strict && v.length < 8 ? 'Password must be at least 8 characters' : ''
