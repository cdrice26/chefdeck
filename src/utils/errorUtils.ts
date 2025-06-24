import { PostgrestError } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

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
