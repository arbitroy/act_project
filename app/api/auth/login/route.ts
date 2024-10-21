import { NextResponse, NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { queryWithRetry } from '../../db'

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json()

        if (!username || !password) {
            return NextResponse.json(
                { success: false, message: 'Username and password are required' },
                { status: 400 }
            )
        }

        const result = await queryWithRetry('SELECT * FROM Users WHERE Username = $1', [username])

        const user = result.rows[0]

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            )
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash)
        
        if (!isValidPassword) {
            return NextResponse.json(
                { success: false, message: 'Invalid password' },
                { status: 401 }
            )
        }

        const JWT_SECRET = process.env.JWT_SECRET
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET is not set')
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        )

        const response = NextResponse.json(
            {
                success: true,
                user: { id: user.id, username: user.username, role: user.role }
            },
            { status: 200 }
        )

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 3600,
            path: '/',
        })

        return response
    } catch (error) {
        console.error('Login error:', error)

        if (error instanceof Error) {
            console.error('Error name:', error.name)
            console.error('Error message:', error.message)
            console.error('Error stack:', error.stack)
        }

        return NextResponse.json(
            {
                success: false,
                message: 'An unexpected error occurred',
                error: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        )
    }
}