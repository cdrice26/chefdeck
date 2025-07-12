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
