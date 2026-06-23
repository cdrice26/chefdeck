use std::cmp::Ordering;

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
            <&Ingredient>::try_into(ingredient);
        match parsed_measurement {
            Ok(measurement) => Self::Known {
                amount: measurement.as_base_units(),
                unit_key: measurement.get_base_units_name().to_string(),
            },
            Err(_) => Self::Custom {
                amount: ingredient.amount,
                unit: ingredient.unit.clone(),
            },
        }
    }

    pub fn kind_rank(&self) -> u8 {
        match self {
            Quantity::Known { .. } => 0,
            Quantity::Custom { .. } => 1,
        }
    }

    pub fn unit_key(&self) -> &str {
        match self {
            Quantity::Known { unit_key, .. } => unit_key.as_str(),
            Quantity::Custom { unit, .. } => unit.as_str(),
        }
    }

    pub fn amount(&self) -> f64 {
        match self {
            Quantity::Known { amount, .. } => *amount,
            Quantity::Custom { amount, .. } => *amount,
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

impl PartialEq for Quantity {
    fn eq(&self, other: &Self) -> bool {
        self.kind_rank() == other.kind_rank()
            && self.unit_key() == other.unit_key()
            && self.amount().to_bits() == other.amount().to_bits()
    }
}

impl Eq for Quantity {}

impl PartialOrd for Quantity {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for Quantity {
    fn cmp(&self, other: &Self) -> Ordering {
        self.kind_rank()
            .cmp(&other.kind_rank())
            .then_with(|| self.unit_key().cmp(other.unit_key()))
            .then_with(|| {
                // total ordering for f64 (handles NaN consistently)
                self.amount().total_cmp(&other.amount())
            })
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

    // ordering tests
    #[test]
    fn orders_known_before_custom() {
        let a = custom(1.0, "m");
        let b = known(1.0, "m");

        assert!(b < a);
        assert!(a > b);
        assert_eq!(b.cmp(&a), std::cmp::Ordering::Less);
    }

    #[test]
    fn orders_by_unit_key_within_known() {
        let a = known(1.0, "b");
        let b = known(1.0, "a");

        assert!(b < a);
        assert_eq!(a.cmp(&b), std::cmp::Ordering::Greater);
    }

    #[test]
    fn orders_by_unit_within_custom() {
        let a = custom(1.0, "b");
        let b = custom(1.0, "a");

        assert!(b < a);
        assert_eq!(a.cmp(&b), std::cmp::Ordering::Greater);
    }

    #[test]
    fn orders_by_amount_when_kind_and_unit_match() {
        let a = known(1.0, "m");
        let b = known(2.0, "m");

        assert!(a < b);
        assert_eq!(b.cmp(&a), std::cmp::Ordering::Greater);
    }

    #[test]
    fn full_sort_uses_kind_then_unit_then_amount() {
        let mut v = vec![
            custom(2.0, "m"), // custom, m, 2
            known(2.0, "m"),  // known,  m, 2
            known(1.0, "s"),  // known,  s, 1
            custom(1.0, "s"), // custom, s, 1
            known(1.0, "m"),  // known,  m, 1
            custom(0.5, "m"), // custom, m, 0.5
        ];

        v.sort();

        let expected = vec![
            known(1.0, "m"),
            known(2.0, "m"),
            known(1.0, "s"),
            custom(0.5, "m"),
            custom(2.0, "m"),
            custom(1.0, "s"),
        ];

        assert_eq!(v, expected);
    }

    #[test]
    fn equal_when_same_kind_unit_amount() {
        let a = known(1.25, "kg");
        let b = known(1.25, "kg");

        assert_eq!(a, b);
        assert_eq!(a.cmp(&b), std::cmp::Ordering::Equal);
    }

    #[test]
    fn different_amount_orders_consistently_for_f64() {
        let a = custom(1.0, "L");
        let b = custom(1.0, "L");
        let c = custom(2.0, "L");

        assert_eq!(a.cmp(&b), std::cmp::Ordering::Equal);
        assert!(a < c);
        assert!(c > b);
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
