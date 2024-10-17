import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const encoder = new TextEncoder();

export async function middleware(request: NextRequest) {
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
        const isValid = await verifyJWT(token, process.env.JWT_SECRET as string);
        if (isValid) {
            return NextResponse.next();
        } else {
            throw new Error('Invalid token');
        }
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

async function verifyJWT(token: string, secret: string) {
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

    return valid;
}


export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
