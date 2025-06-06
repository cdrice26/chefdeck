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
  imgUrl: string;
  sourceUrl: string;
  ingredients: Ingredient[];
  directions: Direction[];
  color: string;
}
