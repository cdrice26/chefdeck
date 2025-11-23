/**
 * Type definitions for recipe-related data structures.
 *
 * These interfaces describe the shapes used across the application for
 * ingredients, directions, and recipe objects.
 */

import { Color } from '@/utils/styles/colorUtils';

/**
 * Represents an ingredient
 */
export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
}

/**
 * Represents a direction
 */
export interface Direction {
  id: string;
  content: string;
}

export interface Recipe {
  id: string;
  title: string;
  servings: number;
  minutes: number;
  imgUrl: string | null;
  sourceUrl: string | null;
  ingredients: Ingredient[];
  directions: Direction[];
  color: Color;
  lastViewed?: Date;
  tags?: string[];
}
