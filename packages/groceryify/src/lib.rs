use crate::{
    ingredient::Ingredient, ingredient_name::IngredientName, ingredient_unit::Quantity,
    lemmatizer::Lemmatizer, parsed_ingredient::ParsedIngredient,
};

mod ingredient;
mod ingredient_name;
mod ingredient_unit;
mod lemmatizer;
mod parsed_ingredient;

/// Takes a list of ingredients and merges like ingredients to create a grocery list.
///
/// # Arguments:
///     * `ingredients`: List of ingredients.
///
/// # Returns:
///     * List of ingredients, with like ingredients merged.
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
}
