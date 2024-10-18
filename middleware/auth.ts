import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'

export async function authMiddleware(request: NextRequest) {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET)
        await jose.jwtVerify(token, secret)
        return NextResponse.next()
    } catch (error) {
        console.error('Error verifying token:', error)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
}