/**
 * Database row types for recipe-related tables.
 *
 * These interfaces represent the raw rows returned by the database (snake_case
 * property names) and are intended for use when converting DB records to the
 * application's TypeScript types.
 */

/**
 * A single ingredient row from the database.
 *
 * - `sequence` is used to order ingredients when rendering.
 */
export interface DBIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  sequence: number;
}

/**
 * A single direction (instruction) row from the database.
 *
 * - `sequence` is used to order directions when rendering.
 */
export interface DBDirection {
  id: string;
  content: string;
  sequence: number;
}

/**
 * Simple view log row for recipes (used to track last viewed times).
 */
export interface DBRecipeViewLog {
  id: string;
  last_viewed: Date;
}

/**
 * Database representation of a recipe row (including related nested arrays).
 *
 * Fields use the database column naming (e.g. `img_url`, `last_viewed`) and
 * may include optional fields returned by stored procedures.
 */
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

/**
 * Database schedule row associated with a recipe and user.
 *
 * - `repeat` is stored as a string in the DB and validated/normalized later.
 */
export interface DBSchedule {
  id: string;
  recipe_id: string;
  user_id: string;
  date: Date;
  repeat: string;
  repeat_end: Date;
}

/**
 * Joined scheduled recipe row (result of a join between schedules and recipes).
 *
 * - `scheduled_date` is returned as a string from some DB procedures and should
 *   be converted to a Date when mapping to application types.
 */
export interface DBScheduledRecipe {
  schedule_id: string;
  recipe_id: string;
  recipe_title: string;
  recipe_color: string;
  scheduled_date: string;
}
