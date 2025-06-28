import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export const getAccessToken = async (req: NextRequest) => {
  const cookieStore = await cookies();
  const accessToken =
    cookieStore.get('accessToken')?.value ??
    req.headers.get('Authorization')?.split(' ')[1];

  return accessToken ?? '';
};

export const getRefreshToken = async (req: NextRequest) => {
  const cookieStore = await cookies();
  const refreshToken =
    cookieStore.get('refreshToken')?.value ??
    req.headers.get('x-refresh-token');
  return refreshToken ?? '';
};
