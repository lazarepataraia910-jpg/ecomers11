import { useId, useState } from 'react'
import { Eye, EyeOff, Info } from 'lucide-react'

interface FieldProps {
  label: string; value: string; error?: string; hint?: string
  onChange: (v: string) => void; onBlur?: () => void
  type?: string; autoComplete?: string; disabled?: boolean
}

export function TextField({ label, value, error, hint, onChange, onBlur, type = 'text', autoComplete, disabled }: FieldProps) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>
      <input id={id} type={type} value={value} disabled={disabled} autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)} onBlur={onBlur}
        aria-invalid={!!error} aria-describedby={`${id}-msg`}
        className={`input ${error ? 'input-error' : ''}`} />
      <p id={`${id}-msg`} className={`mt-1.5 flex items-center gap-2 text-xs ${error ? 'text-danger' : 'text-n-600'}`} role={error ? 'alert' : undefined}>
        {(error || hint) && <Info size={14} aria-hidden />}{error || hint}
      </p>
    </div>
  )
}

export function PasswordField(props: FieldProps) {
  const [show, setShow] = useState(false)
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{props.label}</label>
      <div className="relative">
        <input id={id} type={show ? 'text' : 'password'} value={props.value} disabled={props.disabled}
          autoComplete={props.autoComplete} onChange={(e) => props.onChange(e.target.value)} onBlur={props.onBlur}
          aria-invalid={!!props.error} aria-describedby={`${id}-msg`}
          className={`input pr-11 ${props.error ? 'input-error' : ''}`} />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-n-500 hover:text-n-950">
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <p id={`${id}-msg`} className={`mt-1.5 flex items-center gap-2 text-xs ${props.error ? 'text-danger' : 'text-n-600'}`} role={props.error ? 'alert' : undefined}>
        {(props.error || props.hint) && <Info size={14} aria-hidden />}{props.error || props.hint}
      </p>
    </div>
  )
}
