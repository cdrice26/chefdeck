/**
 * This module contains the middleware function that is responsible for handling HTTP requests and responses in a Next.js application.
 * It verifies if user's access token using the `getAccessToken` util before allowing them to make requests. If there is no valid token,
 * it responds with an error message of 'Unauthorized'. Also handles any errors that occur during middleware execution by returning a JSON response
 * with a status code 500 and an error message 'Internal server error'. The function is exported and can be imported in other modules.
 */
import { NextRequest, NextResponse } from 'next/server'; // Importing the necessary classes for handling HTTP requests and responses
import { createClientWithToken } from './utils/supabaseUtils'; // Function to create a supabase client with a token
import { getAccessToken } from './utils/authUtils'; // Util function to get access token from request headers

/**
 * An array of unprotected paths. These are the routes that don't require user authentication
 */
const unprotectedPaths = [
  '/api/auth/login',
  '/api/auth/confirm',
  '/api/auth/resetPassword',
  '/api/auth/signup',
  '/api/auth/forgotPassword',
  '/api/auth/refreshToken'
];

/**
 * A function to check if a path is unprotected. It compares the given path with each unprotected path and returns true if it matches or starts with any of them.
 * @param {string} path - The path to be checked against the list of unprotected paths
 * @return {boolean} - Whether the path is unprotected (true) or not (false).
 */
function isUnprotected(path: string): boolean {
  return (
    !path.startsWith('/api') ||
    unprotectedPaths.some((p) => path === p || path.startsWith(p + '/'))
  );
}

/**
 * The main middleware function that handles all the HTTP requests. If a request is unprotected, it allows the request to pass through immediately.
 * For authenticated routes, it gets the access token and creates a supabase client with the token. It then checks if there's an existing user for this token.
 * If not, it returns a JSON response with an error message of 'Unauthorized'. In case of any errors during middleware execution, it logs them to console
 * and returns a JSON response with status code 500 and an error message of 'Internal server error'.
 * @param {NextRequest} request - The HTTP request received by the application.
 * @return {Response | NextResponse} - A Promise that resolves into the HTTP Response to be sent back to client or a redirect response if needed.
 */
export async function middleware(
  request: NextRequest
): Promise<Response | NextResponse> {
  const pathname = request.nextUrl.pathname; // The requested route's path

  if (isUnprotected(pathname)) {
    // If the route is unprotected, allow it to pass through immediately
    return NextResponse.next();
  }

  try {
    const accessToken = await getAccessToken(request); // Attempt to get access token from request headers
    const supabase = createClientWithToken(accessToken); // Create a supabase client with the obtained access token

    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (!user || error) {
      // If there is no valid user for this token or an error occurred during authentication, send back an unauthorized response
      return NextResponse.json(
        { error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    // If no errors and there is a valid user, allow the request to pass through
    return NextResponse.next();
  } catch (err) {
    // In case of any other error during middleware execution, log it and send back an internal server error response
    console.error('Middleware error:', err);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

// The matcher config specifies that this middleware should be applied to all requests starting with /api/
export const config = {
  matcher: ['/api/:path*']
};
