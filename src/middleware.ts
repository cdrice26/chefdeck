import { NextRequest, NextResponse } from 'next/server';
import { createClientWithToken } from './utils/supabaseUtils';
import { getAccessToken } from './utils/authUtils';

const unprotectedPaths = [
  '/api/auth/login',
  '/api/auth/confirm',
  '/api/auth/resetPassword',
  '/api/auth/signup',
  '/api/auth/forgotPassword',
  '/api/auth/refreshToken'
];

function isUnprotected(path: string) {
  return (
    !path.startsWith('/api') ||
    unprotectedPaths.some((p) => path === p || path.startsWith(p + '/'))
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isUnprotected(pathname)) {
    return NextResponse.next();
  }

  try {
    const accessToken = await getAccessToken(request);
    const supabase = createClientWithToken(accessToken);

    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (!user || error) {
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    return NextResponse.next();
  } catch (err) {
    console.error('Middleware error:', err);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export const config = {
  matcher: ['/api/:path*']
};
