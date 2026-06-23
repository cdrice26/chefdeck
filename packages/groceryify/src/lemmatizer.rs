use std::collections::HashMap;

pub struct Lemmatizer {
    exceptions: HashMap<String, String>,
}

impl Lemmatizer {
    pub fn new() -> Self {
        // Bundle the file at compile time — zero runtime file I/O
        let data = include_str!("../resources/noun.exc");
        let mut exceptions = HashMap::new();
        for line in data.lines() {
            let mut parts = line.split_whitespace();
            if let (Some(form), Some(lemma)) = (parts.next(), parts.next()) {
                exceptions.insert(form.to_string(), lemma.to_string());
            }
        }
        Self { exceptions }
    }

    pub fn lemmatize(&self, word: &str) -> String {
        let word = word.to_lowercase();
        // 1. Check exception list first
        if let Some(lemma) = self.exceptions.get(&word) {
            return lemma.clone();
        }
        // 2. Suffix stripping rules (NLTK morphy order for nouns)
        let rules: &[(&str, &str)] = &[
            ("ies", "y"),
            ("ves", "f"), // knives → knife, leaves → leaf
            ("ses", "s"),
            ("es", ""),
            ("s", ""),
        ];
        for (suffix, replacement) in rules {
            if word.ends_with(suffix) && word.len() > suffix.len() + 2 {
                return format!("{}{}", &word[..word.len() - suffix.len()], replacement);
            }
        }
        word
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn lemmatizer() -> Lemmatizer {
        Lemmatizer::new()
    }

    // --- Suffix stripping ---

    #[test]
    fn test_ies_to_y() {
        let l = lemmatizer();
        assert_eq!(l.lemmatize("parties"), "party");
        assert_eq!(l.lemmatize("cities"), "city");
        assert_eq!(l.lemmatize("batteries"), "battery");
    }

    #[test]
    fn test_ves_to_f() {
        let l = lemmatizer();
        assert_eq!(l.lemmatize("knives"), "knife");
        assert_eq!(l.lemmatize("leaves"), "leaf");
        assert_eq!(l.lemmatize("wolves"), "wolf");
    }

    #[test]
    fn test_ses_to_s() {
        let l = lemmatizer();
        assert_eq!(l.lemmatize("buses"), "bus");
        assert_eq!(l.lemmatize("gases"), "gas");
    }

    #[test]
    fn test_es_to_empty() {
        let l = lemmatizer();
        assert_eq!(l.lemmatize("boxes"), "box");
        assert_eq!(l.lemmatize("foxes"), "fox");
        assert_eq!(l.lemmatize("churches"), "church");
    }

    #[test]
    fn test_s_to_empty() {
        let l = lemmatizer();
        assert_eq!(l.lemmatize("cats"), "cat");
        assert_eq!(l.lemmatize("dogs"), "dog");
        assert_eq!(l.lemmatize("books"), "book");
    }

    // --- Already singular (no rule should fire) ---

    #[test]
    fn test_already_singular_unchanged() {
        let l = lemmatizer();
        assert_eq!(l.lemmatize("cat"), "cat");
        assert_eq!(l.lemmatize("dog"), "dog");
        assert_eq!(l.lemmatize("city"), "city");
    }

    // --- Minimum-length guard (word.len() > suffix.len() + 2) ---

    #[test]
    fn test_too_short_to_strip_s() {
        // "as" → suffix "s", len=2, required >3 — should not strip
        let l = lemmatizer();
        assert_eq!(l.lemmatize("as"), "as");
    }

    #[test]
    fn test_too_short_to_strip_es() {
        // "es" itself — len=2, required >4 — should not strip
        let l = lemmatizer();
        assert_eq!(l.lemmatize("es"), "es");
    }

    // --- Case insensitivity ---

    #[test]
    fn test_uppercase_input_lowercased() {
        let l = lemmatizer();
        assert_eq!(l.lemmatize("CATS"), "cat");
        assert_eq!(l.lemmatize("Dogs"), "dog");
        assert_eq!(l.lemmatize("PARTIES"), "party");
    }

    // --- Exception list takes priority over rules ---

    #[test]
    fn test_exception_overrides_suffix_rule() {
        let l = lemmatizer();
        // "children" would not be produced by any suffix rule,
        // but it must be in the exception list → "child"
        assert_eq!(l.lemmatize("children"), "child");
        // "geese" → "goose"
        assert_eq!(l.lemmatize("geese"), "goose");
        // "mice" → "mouse"
        assert_eq!(l.lemmatize("mice"), "mouse");
        // "men" → "man"
        assert_eq!(l.lemmatize("men"), "man");
    }

    #[test]
    fn test_exception_lookup_is_case_insensitive() {
        let l = lemmatizer();
        assert_eq!(l.lemmatize("Children"), "child");
        assert_eq!(l.lemmatize("GEESE"), "goose");
    }

    // --- Words with no applicable rule and not in exceptions ---

    #[test]
    fn test_unknown_word_returned_as_is() {
        let l = lemmatizer();
        assert_eq!(l.lemmatize("xyzzy"), "xyzzy");
        assert_eq!(l.lemmatize("blorf"), "blorf");
    }

    // --- Idempotency: lemmatizing a lemma gives the same lemma ---

    #[test]
    fn test_idempotent_on_base_forms() {
        let l = lemmatizer();
        for word in &["cat", "dog", "party", "knife", "wolf"] {
            assert_eq!(
                l.lemmatize(&l.lemmatize(word)),
                l.lemmatize(word),
                "lemmatize({word}) is not idempotent"
            );
        }
    }

    // --- Suffix rule priority order ---

    #[test]
    fn test_ies_takes_priority_over_es_and_s() {
        // "parties" ends with both "ies" and "es" and "s"
        // The "ies→y" rule must win
        let l = lemmatizer();
        assert_eq!(l.lemmatize("parties"), "party");
    }

    #[test]
    fn test_ves_takes_priority_over_es_and_s() {
        let l = lemmatizer();
        // "knives" ends with "ves", "es", "s" — "ves→f" must win
        assert_eq!(l.lemmatize("knives"), "knife");
    }
}
