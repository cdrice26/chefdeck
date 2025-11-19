import { PostgrestError } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * Convert a PostgrestError into a Next.js response with an appropriate HTTP status and JSON body.
 *
 * This helper centralizes mapping from Supabase/PostgREST error codes to user-facing
 * JSON responses. It currently maps:
 *  - '401' -> 401 Unauthorized with a helpful message
 *  - '404' -> 404 Not Found with a simple message
 *  - other -> 500 Internal Server Error
 *
 * @param error - The PostgrestError to convert into an HTTP response.
 * @returns A NextResponse containing a JSON error payload and the corresponding HTTP status code.
 */
export const getErrorResponse = (error: PostgrestError) => {
  if (error.code === '401') {
    return NextResponse.json(
      {
        error: {
          message: 'Unauthorized. Please log in to access your recipes.'
        }
      },
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } else if (error.code === '404') {
    return NextResponse.json(
      { error: { message: 'No recipes found.' } },
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  return NextResponse.json(
    { error: { message: 'Internal Server Error. Please try again later.' } },
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};
