import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const encoder = new TextEncoder();

export async function middleware(request: NextRequest) {
    // Allow access to Express API routes
    if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    const token = request.cookies.get('token')?.value;

    if (request.nextUrl.pathname === '/' ||
        request.nextUrl.pathname === '/login' ||
        request.nextUrl.pathname === '/register') {
        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        const payload = await verifyAndDecodeJWT(token, process.env.JWT_SECRET as string);
        
        // Role-based routing
        if (request.nextUrl.pathname.startsWith('/dashboard')) {
            switch (payload.role) {
                case 'Manager':
                    if (!request.nextUrl.pathname.startsWith('/dashboard/manager') &&
                        !request.nextUrl.pathname.startsWith('/dashboard/master-data')) {
                        return NextResponse.redirect(new URL('/dashboard/manager', request.url));
                    }
                    break;
                case 'PlannedEmployee':
                    if (!request.nextUrl.pathname.startsWith('/dashboard/planned')) {
                        return NextResponse.redirect(new URL('/dashboard/planned', request.url));
                    }
                    break;
                case 'ActualEmployee':
                    if (!request.nextUrl.pathname.startsWith('/dashboard/actual')) {
                        return NextResponse.redirect(new URL('/dashboard/actual', request.url));
                    }
                    break;
                default:
                    return NextResponse.redirect(new URL('/login', request.url));
            }
        }

        return NextResponse.next();
    } catch (error) {
        console.error('Unauthorized route error:', error);
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

function base64UrlDecode(input: string) {
    input = input.replace(/-/g, '+').replace(/_/g, '/');
    const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
    return Uint8Array.from(atob(input + pad), c => c.charCodeAt(0));
}

async function verifyAndDecodeJWT(token: string, secret: string) {
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Invalid token structure');
    }

    const signature = base64UrlDecode(parts[2]);

    // Use Web Crypto API to verify the signature
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
    );

    const valid = await crypto.subtle.verify(
        'HMAC',
        key,
        signature,
        encoder.encode(`${parts[0]}.${parts[1]}`)
    );

    if (!valid) {
        throw new Error('Invalid signature');
    }

    // Decode the payload
    const payload = JSON.parse(atob(parts[1]));
    return payload;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};