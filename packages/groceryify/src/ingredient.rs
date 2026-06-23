use crate::parsed_ingredient::ParsedIngredient;

#[derive(Clone, Debug)]
pub struct Ingredient {
    pub name: String,
    pub amount: f64,
    pub unit: String,
}

impl Ingredient {
    pub fn new(name: &str, amount: f64, unit: &str) -> Self {
        Self {
            name: String::from(name),
            amount,
            unit: String::from(unit),
        }
    }
}

impl From<ParsedIngredient> for Ingredient {
    fn from(value: ParsedIngredient) -> Self {
        Self {
            name: value.name,
            amount: value.quantity.amount(),
            unit: value.quantity.unit_key().to_string(),
        }
    }
}
