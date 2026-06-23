#[derive(Clone, Debug)]
pub struct Ingredient {
    pub name: String,
    pub amount: f64,
    pub unit: String,
}

impl Ingredient {
    pub fn new(name: &str, amount: f64, unit: &str) -> Self {
        Ingredient {
            name: String::from(name),
            amount,
            unit: String::from(unit),
        }
    }
}
