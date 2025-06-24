import { NextResponse } from 'next/server';
import { getRecipes } from '@/services/recipesService';

export async function GET() {
  try {
    const recipes = await getRecipes();
    if (!recipes || recipes.length === 0) {
      return NextResponse.json(
        { data: [] },
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    return NextResponse.json(
      { data: recipes },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    if (error.code === '401') {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to access your recipes.' },
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } else if (error.code === '404') {
      return NextResponse.json(
        { error: 'No recipes found.' },
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error. Please try again later.' },
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
