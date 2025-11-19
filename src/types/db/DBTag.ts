/**
 * Database row type for a tag.
 *
 * Represents the raw tag record returned by the database or stored procedures.
 * Property names follow the database column naming (snake_case).
 *
 * @property tag_id - The unique identifier for the tag row.
 * @property tag_name - The tag name/value displayed in the UI.
 */
export interface DBTag {
  tag_id: string;
  tag_name: string;
}
