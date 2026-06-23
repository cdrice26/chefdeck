use crate::lemmatizer::Lemmatizer;

pub struct IngredientName(pub String);

impl IngredientName {
    pub fn remove_parenthesized(&self) -> Self {
        let mut result = String::new();
        let mut depth: u32 = 0;

        for ch in self.0.chars() {
            match ch {
                '(' => depth += 1,
                ')' => depth = depth.saturating_sub(1),
                _ if depth == 0 => result.push(ch),
                _ => {}
            }
        }

        IngredientName(result.split_whitespace().collect::<Vec<_>>().join(" "))
    }

    pub fn remove_after_comma(&self) -> Self {
        IngredientName(String::from(self.0.split(',').collect::<Vec<&str>>()[0]))
    }

    pub fn lemmatize(&self, lemmatizer: &Lemmatizer) -> Self {
        IngredientName(
            self.0
                .split(" ")
                .map(|word| lemmatizer.lemmatize(word))
                .collect::<Vec<_>>()
                .join(" "),
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // Helper to unwrap the inner String
    fn name(s: &str) -> IngredientName {
        IngredientName(s.to_string())
    }

    fn inner(i: IngredientName) -> String {
        i.0
    }

    // --- remove_parenthesized ---

    #[test]
    fn test_remove_parenthesized_basic() {
        assert_eq!(inner(name("salt (fine)").remove_parenthesized()), "salt");
    }

    #[test]
    fn test_remove_parenthesized_nested() {
        assert_eq!(
            inner(name("butter (unsalted (grass-fed))").remove_parenthesized()),
            "butter"
        );
    }

    #[test]
    fn test_remove_parenthesized_no_parens() {
        assert_eq!(inner(name("olive oil").remove_parenthesized()), "olive oil");
    }

    #[test]
    fn test_remove_parenthesized_empty_parens() {
        assert_eq!(inner(name("sugar ()").remove_parenthesized()), "sugar");
    }

    #[test]
    fn test_remove_parenthesized_parens_in_middle() {
        assert_eq!(
            inner(name("bread (white) crumbs").remove_parenthesized()),
            "bread crumbs"
        );
    }

    #[test]
    fn test_remove_parenthesized_multiple_groups() {
        assert_eq!(
            inner(name("egg (large) yolk (beaten)").remove_parenthesized()),
            "egg yolk"
        );
    }

    #[test]
    fn test_remove_parenthesized_only_parens() {
        assert_eq!(inner(name("(optional)").remove_parenthesized()), "");
    }

    #[test]
    fn test_remove_parenthesized_collapses_whitespace() {
        // Extra spaces left by removal should be collapsed
        assert_eq!(
            inner(name("  salt   (fine)  ").remove_parenthesized()),
            "salt"
        );
    }

    #[test]
    fn test_remove_parenthesized_unmatched_open() {
        // Unmatched '(' — depth increments but never closes; text inside suppressed
        assert_eq!(inner(name("salt (fine").remove_parenthesized()), "salt");
    }

    #[test]
    fn test_remove_parenthesized_unmatched_close() {
        assert_eq!(
            inner(name("salt) pepper").remove_parenthesized()),
            "salt pepper"
        );
    }

    // --- remove_after_comma ---

    #[test]
    fn test_remove_after_comma_basic() {
        assert_eq!(
            inner(name("tomatoes, diced").remove_after_comma()),
            "tomatoes"
        );
    }

    #[test]
    fn test_remove_after_comma_no_comma() {
        assert_eq!(inner(name("garlic").remove_after_comma()), "garlic");
    }

    #[test]
    fn test_remove_after_comma_multiple_commas() {
        // Only the first segment is kept
        assert_eq!(
            inner(name("onion, peeled, chopped").remove_after_comma()),
            "onion"
        );
    }

    #[test]
    fn test_remove_after_comma_leading_comma() {
        assert_eq!(inner(name(",extra").remove_after_comma()), "");
    }

    #[test]
    fn test_remove_after_comma_empty_string() {
        assert_eq!(inner(name("").remove_after_comma()), "");
    }

    // --- lemmatize ---

    #[test]
    fn test_lemmatize_plural_noun() {
        let lemmatizer = Lemmatizer::new();
        assert_eq!(inner(name("tomatoes").lemmatize(&lemmatizer)), "tomato");
    }

    #[test]
    fn test_lemmatize_already_base_form() {
        let lemmatizer = Lemmatizer::new();
        assert_eq!(inner(name("garlic").lemmatize(&lemmatizer)), "garlic");
    }

    #[test]
    fn test_lemmatize_multiple_words() {
        let lemmatizer = Lemmatizer::new();
        // Each word is lemmatized independently
        let result = inner(name("dried tomatoes").lemmatize(&lemmatizer));
        assert_eq!(result, "dried tomato"); // note: no space — see bug note below
    }

    #[test]
    fn test_lemmatize_empty_string() {
        let lemmatizer = Lemmatizer::new();
        assert_eq!(inner(name("").lemmatize(&lemmatizer)), "");
    }
}
