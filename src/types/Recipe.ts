import { Color } from '@/utils/colors/colorUtils';

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
}

export interface Direction {
  id: string;
  content: string;
}

export interface Recipe {
  id: string;
  title: string;
  servings: number;
  minutes: number;
  imgUrl: string | null;
  sourceUrl: string | null;
  ingredients: Ingredient[];
  directions: Direction[];
  color: Color;
  lastViewed?: Date;
}
