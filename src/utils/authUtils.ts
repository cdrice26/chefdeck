import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

/**
 * Retrieve the access token for server-side requests.
 *
 * This function reads cookies from the Next.js cookie store and falls back
 * to the `Authorization` header on the provided request if the cookie is not present.
 *
 * @param req - The NextRequest object containing incoming headers.
 * @returns The access token string (or an empty string if not found).
 */
export const getAccessToken = async (req: NextRequest) => {
  const cookieStore = await cookies();
  const accessToken =
    cookieStore.get('accessToken')?.value ??
    req.headers.get('Authorization')?.split(' ')[1];

  return accessToken ?? '';
};

/**
 * Retrieve the refresh token for server-side requests.
 *
 * This function reads cookies from the Next.js cookie store and falls back
 * to the `x-refresh-token` header on the provided request if the cookie is not present.
 *
 * @param req - The NextRequest object containing incoming headers.
 * @returns The refresh token string (or an empty string if not found).
 */
export const getRefreshToken = async (req: NextRequest) => {
  const cookieStore = await cookies();
  const refreshToken =
    cookieStore.get('refreshToken')?.value ??
    req.headers.get('x-refresh-token');
  return refreshToken ?? '';
};
