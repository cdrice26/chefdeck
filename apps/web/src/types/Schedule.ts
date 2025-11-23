/**
 * Scheduling-related types and helpers.
 *
 * This module defines the Repeat union type for supported schedule repetition
 * options, the Schedule shape used internally by the app, a ScheduleDisplay
 * structure tailored for UI displays, and a small runtime type guard to verify
 * repeat values.
 */

/**
 * Possible repeat options for a schedule.
 *
 * Values:
 * - 'none'         : no repeat
 * - 'weekly'       : repeat every week
 * - 'monthly date' : repeat monthly on the same calendar date
 * - 'monthly day'  : repeat monthly on the same weekday (e.g., second Tuesday)
 */
export type Repeat = 'none' | 'weekly' | 'monthly date' | 'monthly day';

/**
 * Schedule shape used by the application.
 */
export interface Schedule {
  id: string;
  date: Date;
  repeat: Repeat;
  endRepeat: null | Date;
}

/**
 * Display-oriented scheduled recipe shape used in UI views.
 */
export interface ScheduleDisplay {
  scheduleId: string;
  recipeId: string;
  recipeTitle: string;
  recipeColor: string;
  scheduledDate: Date;
}

/**
 * Validate whether a string is a valid Repeat value.
 *
 * @param repeat - Candidate string to check.
 * @returns True when `repeat` is one of the allowed Repeat values, false otherwise.
 */
export const isValidRepeat = (repeat: string): repeat is Repeat =>
  ['none', 'weekly', 'monthly date', 'monthly day'].includes(repeat);
