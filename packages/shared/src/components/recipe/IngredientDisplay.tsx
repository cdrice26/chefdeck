import { Ingredient } from '@/types/Recipe';

/**
 * Compute the greatest common divisor (GCD) of two integers using the Euclidean algorithm.
 * Returns the absolute GCD to ensure positive denominator/numerator values in downstream logic.
 *
 * @param {number} a - First integer
 * @param {number} b - Second integer
 * @returns {number} The greatest common divisor of `a` and `b`
 */
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));

/**
 * Decomposes a decimal number into fraction parts suitable for human-readable display.
 *
 * The function returns an object with:
 * - `whole`: integer whole part
 * - `numNumer`: numerator of the fractional part after reduction
 * - `den`: denominator of the fractional part after reduction
 *
 * Returns `null` for non-finite input (NaN, Infinity).
 *
 * Note: This uses a limited search to find a multiplier that turns the decimal part
 * into an integer while keeping reasonable bounds (controlled by `maxIter`).
 *
 * @param {number} num - Decimal number to convert
 * @returns {{ whole: number; numNumer: number; den: number } | null} The fraction parts or null for invalid input
 */
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

/**
 * Convert a decimal number into a human-friendly fraction string.
 *
 * Examples:
 * - 1.5 => "1 1/2"
 * - 0.5 => "1/2"
 * - 2 => "2"
 *
 * Returns an empty string for invalid/non-finite inputs.
 *
 * @param {number} num - Decimal number to format
 * @returns {string} A string representation of the number as a fraction
 */
export const decimalToFraction = (num: number): string => {
  const parts = toFractionParts(num);
  if (!parts) return '';

  const { whole, numNumer, den } = parts;
  if (numNumer === 0) return `${whole}`;
  if (whole === 0 && numNumer === den) return `1/${den}`;
  return whole > 0 ? `${whole} ${numNumer}/${den}` : `${numNumer}/${den}`;
};

/**
 * IngredientDisplay
 *
 * Presentational component that renders a single ingredient as a list item,
 * formatting numeric amounts into human-readable fractions and hiding units
 * when they are counts.
 *
 * Props:
 * - `ingredient` (Ingredient): The ingredient to render. Expected to have
 *   `amount`, `unit`, and `name` properties among others.
 *
 * Rendering rules:
 * - If `ingredient.amount` === 0, the amount is omitted.
 * - Amounts are converted to fractions via `decimalToFraction`.
 * - Units equal to 'count' are not displayed next to the amount.
 *
 * @param {{ ingredient: Ingredient }} props - Component props
 * @returns {JSX.Element} A list item representing the ingredient
 */
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
