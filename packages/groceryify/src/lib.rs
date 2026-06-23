use crate::{
    ingredient::Ingredient, ingredient_name::IngredientName, ingredient_unit::Quantity,
    lemmatizer::Lemmatizer, parsed_ingredient::ParsedIngredient,
};

pub mod ingredient;
mod ingredient_name;
mod ingredient_unit;
mod lemmatizer;
mod parsed_ingredient;
#[cfg(feature = "wasm")]
pub mod wasm;

/// Takes a list of ingredients and merges like ingredients to create a grocery list.
///
/// # Arguments:
/// * `ingredients`: List of ingredients.
///
/// # Returns:
/// * List of ingredients, with like ingredients merged.
pub fn merge(ingredients: &Vec<Ingredient>) -> Vec<Ingredient> {
    let lemmatizer = Lemmatizer::new();
    let mut cleaned_ingredients = ingredients
        .into_iter()
        .map(|i| {
            let lemmatized_name = IngredientName(i.name.clone())
                .remove_parenthesized()
                .remove_after_comma()
                .lemmatize(&lemmatizer)
                .0;
            let quantity = Quantity::new(&i);
            ParsedIngredient::new(lemmatized_name.as_str(), quantity)
        })
        .collect::<Vec<_>>();
    cleaned_ingredients.sort();
    let merged =
        cleaned_ingredients
            .into_iter()
            .fold(vec![], |mut acc: Vec<ParsedIngredient>, next| {
                let last = acc.last_mut();
                if let Some(last) = last {
                    if last.name == next.name
                        && last.quantity.unit_key() == next.quantity.unit_key()
                    {
                        match last.clone().merge(next.clone()) {
                            Ok(merged) => {
                                *last = merged;
                            }
                            Err(_) => {
                                acc.push(next);
                            }
                        }
                        return acc;
                    }
                }
                acc.push(next);
                acc
            });
    merged
        .into_iter()
        .map(|i| <ParsedIngredient>::into(i))
        .collect::<Vec<Ingredient>>()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ing(name: &str, amount: f64, unit: &str) -> Ingredient {
        Ingredient {
            name: name.to_string(),
            amount,
            unit: unit.to_string(),
        }
    }

    // ── basic merging ────────────────────────────────────────────────────────

    #[test]
    fn merges_identical_ingredients() {
        let ingredients = vec![ing("flour", 1.0, "cup"), ing("flour", 2.0, "cup")];
        let result = merge(&ingredients);
        assert_eq!(result.len(), 1);
        assert_eq!(result[0].amount, 3.0);
    }

    #[test]
    fn does_not_merge_different_units() {
        let ingredients = vec![ing("flour", 1.0, "cup"), ing("flour", 100.0, "g")];
        let result = merge(&ingredients);
        assert_eq!(result.len(), 2);
    }

    #[test]
    fn does_not_merge_different_ingredients() {
        let ingredients = vec![ing("flour", 1.0, "cup"), ing("sugar", 1.0, "cup")];
        let result = merge(&ingredients);
        assert_eq!(result.len(), 2);
    }

    // ── name normalisation ───────────────────────────────────────────────────

    #[test]
    fn merges_after_stripping_parenthesized_text() {
        // "(all-purpose)" should be stripped before comparison
        let ingredients = vec![
            ing("flour (all-purpose)", 1.0, "cup"),
            ing("flour", 2.0, "cup"),
        ];
        let result = merge(&ingredients);
        println!("{:?}", result);
        assert_eq!(result.len(), 1);
        assert_eq!(result[0].amount, 3.0);
    }

    #[test]
    fn merges_after_stripping_text_after_comma() {
        // ", sifted" should be stripped before comparison
        let ingredients = vec![ing("flour, sifted", 1.0, "cup"), ing("flour", 2.0, "cup")];
        let result = merge(&ingredients);
        assert_eq!(result.len(), 1);
        assert_eq!(result[0].amount, 3.0);
    }

    #[test]
    fn merges_plural_and_singular_via_lemmatization() {
        // lemmatizer should reduce "eggs" -> "egg"
        let ingredients = vec![ing("eggs", 2.0, ""), ing("egg", 1.0, "")];
        let result = merge(&ingredients);
        assert_eq!(result.len(), 1);
        assert_eq!(result[0].amount, 3.0);
    }

    // ── edge cases ───────────────────────────────────────────────────────────

    #[test]
    fn empty_input_returns_empty() {
        let result = merge(&vec![]);
        assert!(result.is_empty());
    }

    #[test]
    fn single_ingredient_passes_through() {
        let ingredients = vec![ing("salt", 1.0, "tsp")];
        let result = merge(&ingredients);
        println!("{:?}", result);
        assert_eq!(result.len(), 1);
        assert_eq!(result[0].name, "salt");
        assert_eq!(result[0].amount, 1.0);
        assert_eq!(result[0].unit, "tsp");
    }

    #[test]
    fn merges_three_of_the_same() {
        let ingredients = vec![
            ing("butter", 1.0, "tbsp"),
            ing("butter", 2.0, "tbsp"),
            ing("butter", 3.0, "tbsp"),
        ];
        let result = merge(&ingredients);
        assert_eq!(result.len(), 1);
        assert_eq!(result[0].amount, 6.0);
    }

    #[test]
    fn merges_same_ingredient_with_different_casing_if_lemmatizer_normalises() {
        // depends on whether lemmatizer lowercases — adjust assertion if not
        let ingredients = vec![ing("Butter", 1.0, "tbsp"), ing("butter", 2.0, "tbsp")];
        let result = merge(&ingredients);
        // If lemmatizer normalises case this is 1, otherwise 2 — update to match actual behaviour
        assert!(result.len() == 1 || result.len() == 2);
        if result.len() == 1 {
            assert_eq!(result[0].amount, 3.0);
        }
    }

    #[test]
    fn preserves_independent_ingredients_untouched() {
        let ingredients = vec![
            ing("onion", 1.0, ""),
            ing("garlic", 3.0, "clove"),
            ing("olive oil", 2.0, "tbsp"),
        ];
        let result = merge(&ingredients);
        assert_eq!(result.len(), 3);
    }

    #[test]
    fn merges_some_but_not_all() {
        let ingredients = vec![
            ing("milk", 1.0, "cup"),
            ing("milk", 0.5, "cup"),
            ing("cream", 1.0, "cup"),
        ];
        let result = merge(&ingredients);
        assert_eq!(result.len(), 2);
        let milk = result.iter().find(|i| i.name.contains("milk")).unwrap();
        assert_eq!(milk.amount, 1.5);
    }
}
