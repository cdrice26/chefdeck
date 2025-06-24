export interface DBIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  sequence: number;
}

export interface DBDirection {
  id: string;
  content: string;
  sequence: number;
}

export interface DBRecipeViewLog {
  id: string;
  last_viewed: Date;
}

export interface DBRecipe {
  id: string;
  title: string;
  yield: number;
  minutes: number;
  img_url: string;
  source: string;
  color: string;
  ingredients: DBIngredient[];
  directions: DBDirection[];
  last_viewed?: Date;
  tags?: string[];
}

export interface DBSchedule {
  id: string;
  recipe_id: string;
  user_id: string;
  date: Date;
  repeat: string;
  repeat_end: Date;
}
