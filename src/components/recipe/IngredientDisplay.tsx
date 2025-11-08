import { Ingredient } from '@/types/Recipe';

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));

const toFractionParts = (num: number) => {
  if (!Number.isFinite(num)) return null;

  const whole = Math.floor(num);
  const decimal = +(num - whole).toFixed(12); // avoid floating noise

  if (decimal === 0) return { whole, numNumer: 0, den: 1 };

  // find multiplier that makes decimal an integer (limit search)
  const maxIter = 10000;
  const findMultiplier = (d: number) =>
    Array.from({ length: maxIter }, (_, i) => i + 1)
      .map((i) => ({ i, prod: +(d * i).toFixed(12) }))
      .find((p) => Math.abs(p.prod - Math.round(p.prod)) < 1e-12) ?? null;

  const found = findMultiplier(decimal);
  if (!found) return { whole, numNumer: Math.round(decimal * 1e12), den: 1e12 };

  const rawNumer = Math.round(found.prod);
  const rawDen = found.i;
  const divisor = gcd(rawNumer, rawDen);

  return { whole, numNumer: rawNumer / divisor, den: rawDen / divisor };
};

export const decimalToFraction = (num: number): string => {
  const parts = toFractionParts(num);
  if (!parts) return '';

  const { whole, numNumer, den } = parts;
  if (numNumer === 0) return `${whole}`;
  if (whole === 0 && numNumer === den) return `1/${den}`;
  return whole > 0 ? `${whole} ${numNumer}/${den}` : `${numNumer}/${den}`;
};

const IngredientDisplay = ({ ingredient }: { ingredient: Ingredient }) => (
  <li>
    <strong>
      {ingredient?.amount === 0 ? '' : decimalToFraction(ingredient?.amount)}{' '}
      {ingredient?.unit === 'count' ? '' : ingredient?.unit}
    </strong>{' '}
    {ingredient?.name}
  </li>
);

export default IngredientDisplay;
