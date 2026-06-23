use crate::{
    ingredient::Ingredient, ingredient_name::IngredientName, ingredient_unit::Quantity,
    lemmatizer::Lemmatizer,
};

mod ingredient;
mod ingredient_name;
mod ingredient_unit;
mod lemmatizer;

pub fn merge(ingredients: &Vec<Ingredient>) {
    let lemmatizer = Lemmatizer::new();
    let cleaned_ingredients = ingredients.into_iter().map(|i| {
        let lemmatized_name = IngredientName(i.name.clone())
            .remove_parenthesized()
            .remove_after_comma()
            .lemmatize(&lemmatizer)
            .0;
        let quantity = Quantity::new(&i);
        let (amount, unit) = match quantity {
            Quantity::Known { amount, unit_key } => (amount, unit_key),
            Quantity::Custom { amount, unit } => (amount, unit),
        };
        Ingredient::new(lemmatized_name.as_str(), amount, unit.as_str())
    });
}

pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}
