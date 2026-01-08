import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'myway_session';

// Replicate signing logic for middleware (can't use Node.js crypto here)
async function sign(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  
  // Convert to base64url without Buffer (Edge runtime compatible)
  const bytes = new Uint8Array(signature);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function verify(message: string, signature: string, secret: string): Promise<boolean> {
  const expectedSignature = await sign(message, secret);
  // Timing-safe comparison
  if (signature.length !== expectedSignature.length) return false;
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  return result === 0;
}

async function validateSession(token: string): Promise<boolean> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;
  
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  
  const [payload, signature] = parts;
  
  // Verify signature
  const isValid = await verify(payload, signature, secret);
  if (!isValid) return false;
  
  // Check expiry
  const match = payload.match(/^session:(\d+)$/);
  if (!match) return false;
  
  const expiresAt = parseInt(match[1], 10);
  if (Date.now() > expiresAt) return false;
  
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow access to login page and auth API routes
  if (
    pathname === '/login' ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico')
  ) {
    return NextResponse.next();
  }
  
  // Check for session cookie
  const sessionToken = request.cookies.get(COOKIE_NAME)?.value;
  
  if (!sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Validate session
  const isValid = await validateSession(sessionToken);
  
  if (!isValid) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    // Clear invalid cookie
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image).*)',
  ],
};

