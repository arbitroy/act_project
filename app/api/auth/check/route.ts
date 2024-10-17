import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { queryWithRetry } from '../../db'


export async function GET() {
    const cookieStore = cookies()
    const token = cookieStore.get('token')

    if (!token) {
        return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    try {
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET as string) as { id: number, username: string, role: string }

        // Fetch the latest user data from the database
        const result = await queryWithRetry('SELECT UserId, Username, Role FROM Users WHERE UserId = $1', [decoded.id])

        if (result.rows.length === 0) {
            // User not found in the database
            return NextResponse.json({ authenticated: false }, { status: 401 })
        }

        const user = result.rows[0]

        return NextResponse.json({
            authenticated: true,
            user: {
                id: user.userid,
                username: user.username,
                role: user.role
            }
        }, { status: 200 })
    } catch (error) {
        console.error('Authentication check error:', error)
        return NextResponse.json({ authenticated: false }, { status: 401 })
    }
}