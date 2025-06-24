import { NextResponse } from 'next/server';
import { getTags } from '@/services/tagsService';

export async function GET() {
  try {
    const tags = await getTags();
    return NextResponse.json(tags, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });
  } catch (error: any) {
    if (error.code === '401') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    } else if (error.code === '404') {
      return NextResponse.json(
        { error: 'No tags found' },
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
