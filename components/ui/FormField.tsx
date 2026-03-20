import { ReactNode } from 'react'

type Props = {
    label: string
    hint?: string
    children: ReactNode
}

export function FormField({ label, hint, children }: Props) {
    return (
        <div className="form-group">
            <label className="form-label">{label}</label>
            {children}
            {hint && <div className="form-hint">{hint}</div>}
        </div>
    )
}
