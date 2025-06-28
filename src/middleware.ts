import { NextRequest, NextResponse } from 'next/server';
import { createClientFromHeaders } from './utils/supabase/supabase';

const unprotectedPaths = [
  '/login',
  '/auth',
  '/signup',
  '/forgotPassword',
  '/api/auth/login',
  '/api/auth/confirm',
  '/api/auth/resetPassword',
  '/api/auth/signup',
  '/api/auth/forgotPassword',
  '/',
  '/static/confirmSuccess',
  '/static/error',
  '/confirm'
];

function isUnprotected(path: string) {
  return (
    !path.startsWith('/api') ||
    unprotectedPaths.some((p) => path === p || path.startsWith(p + '/'))
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isUnprotected(pathname)) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');
  const accessToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!accessToken) {
    if (pathname.includes('/api')) {
      return NextResponse.json(
        { error: 'User is not signed in' },
        { status: 401 }
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  const supabase = createClientFromHeaders(
    request.headers.get('Authorization')
  );

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (!user || error) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Check if user has a profile (replace with your logic as needed)
  const { data } = await supabase.rpc('get_profile', {
    current_user_id: user.id
  });
  const username = data ?? null;

  if (!username && pathname !== '/setupProfile') {
    const url = request.nextUrl.clone();
    url.pathname = '/setupProfile';
    url.searchParams.set('redirectTo', encodeURIComponent(pathname));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
