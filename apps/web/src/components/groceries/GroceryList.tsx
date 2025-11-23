import { Ingredient } from '@/types/Recipe';
import IngredientDisplay from '../recipe/IngredientDisplay';

/**
 * GroceryList component.
 *
 * Renders a list of grocery ingredients using the `IngredientDisplay` component.
 *
 * @param {{ groceries: Ingredient[] }} props - Component props.
 * @param {Ingredient[]} props.groceries - Array of ingredients to display.
 * @returns {JSX.Element} An unordered list of ingredients.
 *
 * @example
 * // <GroceryList groceries={[{ id: '1', name: 'Tomato', amount: 2, unit: 'count' }]} />
 */
const GroceryList: React.FC<{ groceries: Ingredient[] }> = ({
  groceries
}: {
  groceries: Ingredient[];
}) => (
  <ul>
    {groceries.map((g, i) => (
      <IngredientDisplay key={i} ingredient={g} />
    ))}
  </ul>
);

export default GroceryList;
