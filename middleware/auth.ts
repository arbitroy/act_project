import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export async function authMiddleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const JWT_SECRET = process.env.JWT_SECRET
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET is not set')
        }

        return NextResponse.next()
    } catch (error) {
        console.error('Error verifying token:', error)
        
        if (error instanceof jwt.JsonWebTokenError) {
            // Token verification failed
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        } else if (error instanceof jwt.TokenExpiredError) {
            // Token has expired
            return NextResponse.json({ error: 'Token expired' }, { status: 401 })
        } else {
            // Other errors (like missing JWT_SECRET)
            return NextResponse.json({ error: 'Authentication error' }, { status: 500 })
        }
    }
}