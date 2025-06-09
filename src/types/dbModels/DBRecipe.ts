interface DBIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  sequence: number;
}

interface DBDirection {
  id: string;
  content: string;
  sequence: number;
}

interface DBRecipe {
  id: string;
  title: string;
  yield: number;
  minutes: number;
  img_url: string;
  source: string;
  color: string;
  ingredients: DBIngredient[];
  directions: DBDirection[];
}
