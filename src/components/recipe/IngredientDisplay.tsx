import { Ingredient } from '@/types/Recipe';

const IngredientDisplay = ({ ingredient }: { ingredient: Ingredient }) => (
  <li>
    <strong>
      {ingredient?.amount === 0 ? '' : ingredient?.amount}{' '}
      {ingredient?.unit === 'count' ? '' : ingredient?.unit}
    </strong>{' '}
    {ingredient?.name}
  </li>
);

export default IngredientDisplay;
