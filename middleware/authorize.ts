import { NextResponse } from 'next/server'
import { JWTPayload } from '@/lib/auth'

export function authorize(allowedRoles: string[]) {
    return (user: JWTPayload): NextResponse | void => {
        if (!allowedRoles.includes(user.role)) {
            return NextResponse.json({ error: 'Acesso negado: privilégios insuficientes.' }, { status: 403 })
        }
    }
}
