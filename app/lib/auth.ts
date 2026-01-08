import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const COOKIE_NAME = 'myway_session';
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

// Simple HMAC-like signing using Web Crypto API
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
  return Buffer.from(signature).toString('base64url');
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

export async function createSession(): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET not configured');
  
  const expiresAt = Date.now() + SESSION_DURATION;
  const payload = `session:${expiresAt}`;
  const signature = await sign(payload, secret);
  
  return `${payload}.${signature}`;
}

export async function validateSession(token: string): Promise<boolean> {
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

export async function validatePassword(password: string): Promise<boolean> {
  const correctPassword = process.env.AUTH_PASSWORD;
  if (!correctPassword) return false;
  
  // Timing-safe comparison
  if (password.length !== correctPassword.length) return false;
  let result = 0;
  for (let i = 0; i < password.length; i++) {
    result |= password.charCodeAt(i) ^ correctPassword.charCodeAt(i);
  }
  return result === 0;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    path: '/',
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export function getSessionFromRequest(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_NAME)?.value ?? null;
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getSessionFromCookies();
  if (!token) return false;
  return validateSession(token);
}

