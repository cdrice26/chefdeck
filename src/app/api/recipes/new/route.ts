import createOrUpdateRecipe from '@/services/recipeUpdateService';
import { NextRequest } from 'next/server';

export const POST = async (req: NextRequest) => await createOrUpdateRecipe(req);
