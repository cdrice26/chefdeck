use std::cmp::Ordering;

use crate::ingredient_unit::Quantity;

#[derive(Debug, Clone)]
pub struct ParsedIngredient {
    pub name: String,
    pub quantity: Quantity,
}

impl ParsedIngredient {
    pub fn new(name: &str, quantity: Quantity) -> Self {
        Self {
            name: name.to_string(),
            quantity,
        }
    }

    pub fn merge(self, other: Self) -> Result<Self, (Quantity, Quantity)> {
        Ok(Self {
            name: self.name,
            quantity: self.quantity.try_add(other.quantity)?,
        })
    }
}

impl PartialEq for ParsedIngredient {
    fn eq(&self, other: &Self) -> bool {
        self.name == other.name && self.quantity == other.quantity
    }
}

impl Eq for ParsedIngredient {}

impl PartialOrd for ParsedIngredient {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for ParsedIngredient {
    fn cmp(&self, other: &Self) -> Ordering {
        self.name
            .cmp(&other.name)
            .then_with(|| self.quantity.cmp(&other.quantity))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::cmp::Ordering;

    // Adjust imports if needed
    use crate::ingredient_unit::Quantity;

    fn pi(name: &str, q: Quantity) -> ParsedIngredient {
        ParsedIngredient::new(name, q)
    }

    fn q_known(amount: f64, unit_key: &str) -> Quantity {
        Quantity::Known {
            amount,
            unit_key: unit_key.to_string(),
            original_unit: "tsp".to_string(),
        }
    }
    fn q_custom(amount: f64, unit: &str) -> Quantity {
        Quantity::Custom {
            amount,
            unit: unit.to_string(),
        }
    }

    #[test]
    fn orders_by_name_first() {
        let a = pi("b", q_known(1.0, "m"));
        let b = pi("a", q_known(2.0, "m"));

        assert!(b < a);
        assert_eq!(a.cmp(&b), Ordering::Greater);
    }

    #[test]
    fn orders_by_quantity_when_names_match() {
        let a = pi("x", q_known(1.0, "m"));
        let b = pi("x", q_known(2.0, "m"));

        assert!(a < b);
        assert_eq!(b.cmp(&a), Ordering::Greater);
    }

    #[test]
    fn uses_quantity_tiebreaker_kind_then_unit_then_amount() {
        // Known should sort before Custom when names match.
        let known = pi("x", q_known(1.0, "kg"));
        let custom = pi("x", q_custom(0.0, "g"));

        assert!(known < custom);
        assert_eq!(known.cmp(&custom), Ordering::Less);
    }

    #[test]
    fn full_sort_uses_name_then_quantity() {
        let mut v = vec![
            pi("b", q_custom(2.0, "m")), // name b, custom
            pi("a", q_known(2.0, "m")),  // name a, known
            pi("a", q_custom(0.5, "m")), // name a, custom
            pi("a", q_known(1.0, "s")),  // name a, known
            pi("b", q_known(0.1, "a")),  // name b, known
            pi("a", q_known(3.0, "m")),
        ];

        v.sort();

        // Name order: a..., then b...
        // Within "a": Known first; then by unit_key; then amount.
        let expected = vec![
            pi("a", q_known(2.0, "m")), // unit_key "m" < "s"
            pi("a", q_known(3.0, "m")),
            pi("a", q_known(1.0, "s")),
            pi("a", q_custom(0.5, "m")),
            pi("b", q_known(0.1, "a")),
            pi("b", q_custom(2.0, "m")),
        ];

        assert_eq!(v, expected);
    }

    #[test]
    fn equal_when_name_and_quantity_equal() {
        let a = pi("x", q_known(1.25, "kg"));
        let b = pi("x", q_known(1.25, "kg"));

        assert_eq!(a, b);
        assert_eq!(a.cmp(&b), Ordering::Equal);
    }

    #[test]
    fn different_names_never_need_quantity() {
        let a = pi("b", q_custom(0.0, "m"));
        let b = pi("a", q_known(999.0, "s"));

        assert!(b < a);
        assert_eq!(a.cmp(&b), Ordering::Greater);
    }
}
