import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { queryWithRetry } from '../../db'



export async function POST(request: Request) {
    const { username, password } = await request.json()
    if (!username || !password) {
        return NextResponse.json({ success: false, message: 'Username and password are required' }, { status: 400 })
    }

    try {
        const result = await queryWithRetry('SELECT * FROM Users WHERE Username = $1', [username])

        const user = result.rows[0]

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
        }
        const isValidPassword = await bcrypt.compare(password, user.password)
        
        if (!isValidPassword) {
            return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 })
        }

        const token = jwt.sign(
            { id: user.userid, username: user.username, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '1h' }
        )


        const response = NextResponse.json(
            { success: true, user: { id: user.userid, username: user.username, role: user.role } },
            { status: 200 }
        )

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600,
            path: '/',
        })

        return response
    } catch (error) {
        console.error('Detailed login error:', error)
        console.error('Error stack:', error.stack)
        if (error instanceof Error) {
            console.error('Error name:', error.name)
            console.error('Error message:', error.message)
        }
        if ('code' in error) console.error('Error code:', error.code)
        if ('detail' in error) console.error('Error detail:', error.detail)
        return NextResponse.json({ success: false, message: 'An unexpected error occurred', error: error.message }, { status: 500 })
    }
}