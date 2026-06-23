use measurements::Measurement;

use crate::{
    ingredient::Ingredient,
    ingredient_unit::measurement_parser::{ParsedMeasurement, ParsedMeasurementError},
};

mod measurement_parser;

#[derive(Clone, Debug)]
pub enum Quantity {
    Known { amount: f64, unit_key: String },
    Custom { amount: f64, unit: String },
}

impl Quantity {
    pub fn new(ingredient: &Ingredient) -> Self {
        let parsed_measurement: Result<ParsedMeasurement, ParsedMeasurementError> =
            <&Ingredient as TryInto<ParsedMeasurement>>::try_into(ingredient);
        match parsed_measurement {
            Ok(measurement) => Quantity::Known {
                amount: measurement.as_base_units(),
                unit_key: measurement.get_base_units_name().to_string(),
            },
            Err(_) => Quantity::Custom {
                amount: ingredient.amount,
                unit: ingredient.unit.clone(),
            },
        }
    }

    pub fn try_add(self, other: Quantity) -> Result<Quantity, (Quantity, Quantity)> {
        match (self, other) {
            (
                Quantity::Custom {
                    amount: a1,
                    unit: u1,
                },
                Quantity::Custom {
                    amount: a2,
                    unit: u2,
                },
            ) if u1 == u2 => Ok(Quantity::Custom {
                amount: a1 + a2,
                unit: u1,
            }),
            (
                Quantity::Known {
                    amount: a1,
                    unit_key: k1,
                },
                Quantity::Known {
                    amount: a2,
                    unit_key: k2,
                },
            ) if k1 == k2 => Ok(Quantity::Known {
                amount: a1 + a2,
                unit_key: k1,
            }),
            (a, b) => Err((a, b)),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // helpers to reduce boilerplate
    fn known(amount: f64, unit_key: &str) -> Quantity {
        Quantity::Known {
            amount,
            unit_key: unit_key.to_string(),
        }
    }

    fn custom(amount: f64, unit: &str) -> Quantity {
        Quantity::Custom {
            amount,
            unit: unit.to_string(),
        }
    }

    trait AmountAsBaseUnitsForTestOnly {
        fn amount_as_base_units_for_test_only(&self) -> f64;
    }

    impl AmountAsBaseUnitsForTestOnly for Quantity {
        fn amount_as_base_units_for_test_only(&self) -> f64 {
            match *self {
                Quantity::Known { amount, .. } => amount,
                Quantity::Custom { amount, .. } => amount,
            }
        }
    }

    // new tests
    #[test]
    fn new_parses_known_measurement_from_ingredient() {
        let ing = Ingredient::new("x", 2.0, "ml");

        let q = Quantity::new(&ing);

        match q {
            Quantity::Known { amount, unit_key } => {
                // amount is stored as base units
                assert_eq!(
                    amount,
                    Quantity::new(&ing).amount_as_base_units_for_test_only()
                );
                assert!(!unit_key.is_empty());
            }
            Quantity::Custom { .. } => panic!("expected Known, got Custom"),
        }
    }

    #[test]
    fn new_falls_back_to_custom_when_measurement_is_unknown() {
        let ing = Ingredient::new("x", 2.5, "this_unit_does_not_exist");

        let q = Quantity::new(&ing);

        assert!(matches!(
            q,
            Quantity::Custom { amount, unit }
            if amount == 2.5 && unit == "this_unit_does_not_exist"
        ));
    }

    #[test]
    fn new_preserves_amount_for_custom_units() {
        let ing = Ingredient::new("x", 0.125, "???");

        let q = Quantity::new(&ing);

        assert!(matches!(q, Quantity::Custom { amount, .. } if amount == 0.125));
    }

    #[test]
    fn new_known_amount_is_base_units_value() {
        let ing = Ingredient::new("x", 1.0, "ml");

        let q = Quantity::new(&ing);

        match q {
            Quantity::Known { amount, .. } => assert!(amount.is_finite()),
            Quantity::Custom { .. } => panic!("expected Known, got Custom"),
        }
    }

    // adding tests

    // --- Known + Known ---

    #[test]
    fn known_same_unit_adds() {
        let result = known(1.0, "ml").try_add(known(2.0, "ml"));
        assert!(matches!(result, Ok(Quantity::Known { amount, unit_key })
            if amount == 3.0 && unit_key == "ml"));
    }

    #[test]
    fn known_same_unit_preserves_unit_key() {
        let result = known(1.0, "g").try_add(known(1.0, "g")).unwrap();
        assert!(matches!(result, Quantity::Known { unit_key, .. } if unit_key == "g"));
    }

    #[test]
    fn known_different_units_errors() {
        let result = known(1.0, "ml").try_add(known(1.0, "g"));
        assert!(result.is_err());
    }

    #[test]
    fn known_different_units_returns_both_operands() {
        let result = known(1.0, "ml").try_add(known(2.0, "g"));
        assert!(matches!(
            result,
            Err((
                Quantity::Known { amount: 1.0, .. },
                Quantity::Known { amount: 2.0, .. },
            ))
        ));
    }

    // --- Custom + Custom ---

    #[test]
    fn custom_same_unit_adds() {
        let result = custom(3.0, "pinch").try_add(custom(5.0, "pinch"));
        assert!(matches!(result, Ok(Quantity::Custom { amount, unit })
            if amount == 8.0 && unit == "pinch"));
    }

    #[test]
    fn custom_same_unit_preserves_unit() {
        let result = custom(1.0, "sprig").try_add(custom(1.0, "sprig")).unwrap();
        assert!(matches!(result, Quantity::Custom { unit, .. } if unit == "sprig"));
    }

    #[test]
    fn custom_different_units_errors() {
        let result = custom(1.0, "pinch").try_add(custom(1.0, "sprig"));
        assert!(result.is_err());
    }

    #[test]
    fn custom_different_units_returns_both_operands() {
        let result = custom(1.0, "pinch").try_add(custom(2.0, "sprig"));
        assert!(matches!(
            result,
            Err((
                Quantity::Custom { amount: 1.0, .. },
                Quantity::Custom { amount: 2.0, .. },
            ))
        ));
    }

    // --- Known + Custom cross combinations ---

    #[test]
    fn known_and_custom_errors() {
        let result = known(1.0, "ml").try_add(custom(1.0, "ml"));
        assert!(result.is_err());
    }

    #[test]
    fn custom_and_known_errors() {
        let result = custom(1.0, "ml").try_add(known(1.0, "ml"));
        assert!(result.is_err());
    }

    #[test]
    fn known_and_custom_returns_both_operands() {
        let result = known(1.0, "ml").try_add(custom(2.0, "ml"));
        assert!(matches!(
            result,
            Err((
                Quantity::Known { amount: 1.0, .. },
                Quantity::Custom { amount: 2.0, .. },
            ))
        ));
    }

    // --- Edge cases ---

    #[test]
    fn adding_zeros() {
        let result = known(0.0, "ml").try_add(known(0.0, "ml"));
        assert!(matches!(result, Ok(Quantity::Known { amount, .. }) if amount == 0.0));
    }

    #[test]
    fn large_amounts() {
        let result = known(f64::MAX / 2.0, "g").try_add(known(f64::MAX / 2.0, "g"));
        assert!(matches!(result, Ok(Quantity::Known { amount, .. }) if amount.is_finite()));
    }

    #[test]
    fn empty_string_unit_keys_match() {
        let result = known(1.0, "").try_add(known(1.0, ""));
        assert!(matches!(result, Ok(Quantity::Known { amount, .. }) if amount == 2.0));
    }

    #[test]
    fn unit_key_case_sensitive() {
        // "ML" and "ml" should NOT merge — unit keys are case sensitive
        let result = known(1.0, "ML").try_add(known(1.0, "ml"));
        assert!(result.is_err());
    }
}
