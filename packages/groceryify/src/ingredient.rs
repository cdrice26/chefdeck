use crate::{ingredient_unit::Quantity, parsed_ingredient::ParsedIngredient};

use measurements::{Mass, Measurement, Volume};
use serde::{Deserialize, Serialize};

fn convert_from_base(base_amount: f64, base_unit: &str, original_unit: &str) -> f64 {
    let one_target_in_base = match base_unit {
        "l" => format!("1 {original_unit}")
            .parse::<Volume>()
            .unwrap()
            .as_base_units(),
        "kg" => format!("1 {original_unit}")
            .parse::<Mass>()
            .unwrap()
            .as_base_units(),
        _ => return base_amount, // unknown dimension, give up
    };
    base_amount / one_target_in_base
}

#[derive(Clone, Debug, Deserialize, Serialize)]
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
        match value.quantity {
            Quantity::Known {
                amount,
                unit_key,
                original_unit,
            } => {
                let display_amount = convert_from_base(amount, &unit_key, &original_unit);
                Self {
                    name: value.name,
                    amount: display_amount,
                    unit: original_unit,
                }
            }
            Quantity::Custom { amount, unit } => Self {
                name: value.name,
                amount,
                unit,
            },
        }
    }
}
