import { OptionType } from 'chefdeck-shared/server';
import { DBTag } from '@/types/db/DBTag';

/**
 * Convert an array of DBTag records into option objects consumable by the TagSelector.
 *
 * This function maps each database tag row to an `OptionType` with `value` and
 * `label` both derived from the `tag_name` field.
 *
 * @param tags - Array of DBTag objects retrieved from the backend.
 * @returns An array of OptionType objects suitable for use in select controls.
 */
const parseTags = (tags: DBTag[]): OptionType[] =>
  tags.map((tag) => ({
    value: tag.tag_name,
    label: tag.tag_name
  }));

export default parseTags;
