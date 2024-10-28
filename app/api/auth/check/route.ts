import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { queryWithRetry } from '../../db'

export async function GET() {
    const cookieStore = cookies()
    const token = cookieStore.get('token')

    // If no token exists, return a 200 response with authenticated: false
    // This is an expected state, not an error
    if (!token) {
        return NextResponse.json({
            authenticated: false,
            message: 'No active session'
        }, {
            status: 200  // Changed from 401 to 200
        })
    }

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined')
        }

        const decoded = jwt.verify(token.value, process.env.JWT_SECRET) as {
            id: number,
            username: string,
            role: string
        }

        // Fetch the latest user data from the database
        const result = await queryWithRetry(
            'SELECT Id, Username, Role FROM Users WHERE Id = $1',
            [decoded.id]
        )

        if (result.rows.length === 0) {
            // User not found in the database - clear the invalid token
            const response = NextResponse.json({
                authenticated: false,
                message: 'Session expired'
            }, {
                status: 200  // Changed from 401 to 200
            })

            // Clear the invalid token
            response.cookies.delete('token')
            return response
        }

        const user = result.rows[0]

        return NextResponse.json({
            authenticated: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        }, {
            status: 200
        })
    } catch (error) {
        console.error('Authentication check error:', error)
        let message = 'Session expired'
        let clearToken = false

        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            clearToken = true  // Clear token for JWT-related errors
        } else if (error instanceof Error && error.message === 'JWT_SECRET is not defined') {
            message = 'Server configuration error'
            clearToken = false
        }

        const response = NextResponse.json({
            authenticated: false,
            message
        }, {
            status: 200  // Changed from 401 to 200
        })

        if (clearToken) {
            response.cookies.delete('token')
        }

        return response
    }
}