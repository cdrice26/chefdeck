import { Ingredient } from '@/types/Recipe';
import IngredientDisplay from '../recipe/IngredientDisplay';

const GroceryList = ({ groceries }: { groceries: Ingredient[] }) => (
  <ul>
    {groceries.map((g, i) => (
      <IngredientDisplay key={i} ingredient={g} />
    ))}
  </ul>
);

export default GroceryList;
