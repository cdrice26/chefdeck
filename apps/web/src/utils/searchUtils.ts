/**
 * Remove words from a query that are prefixes of any selected tag labels.
 *
 * This helper is used to avoid duplicating tag text when tags are selected via
 * the UI while the same words may also appear in the free-text search query.
 * For example, if a tag with label "gluten-free" is selected and the query
 * contains "gluten", that word will be removed from the returned query.
 *
 * @param query - The raw search query string.
 * @param selected - Array of selected tag-like objects which must include a `label` property.
 * @returns A normalized query string with tag-prefix words removed and excess whitespace trimmed.
 */
function removeTagPrefixesFromQuery(
  query: string,
  selected: { label: string }[]
) {
  let newQuery = query;
  selected.forEach((tag) => {
    newQuery = newQuery
      .split(/\s+/)
      .filter((word) => !tag.label.toLowerCase().startsWith(word.toLowerCase()))
      .join(' ');
  });
  return newQuery.replace(/\s+/g, ' ').trim();
}

export default removeTagPrefixesFromQuery;
