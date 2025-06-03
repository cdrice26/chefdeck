export interface Ingredient {
  id: string | null; // Allow null for new ingredients
  name: string;
  amount: number;
  unit: string;
}

export interface Direction {
  id: string | null; // Allow null for new directions
  content: string;
}

export interface Recipe {
  id: string;
  title: string;
  servings: number;
  minutes: number;
  imgUrl: string;
  sourceUrl: string;
  ingredients: Ingredient[];
  directions: Direction[];
}
