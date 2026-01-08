import { NextRequest, NextResponse } from 'next/server';
import { validatePassword, createSession, setSessionCookie } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }
    
    const isValid = await validatePassword(password);
    
    if (!isValid) {
      // Add small delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 500));
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }
    
    const token = await createSession();
    await setSessionCookie(token);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

