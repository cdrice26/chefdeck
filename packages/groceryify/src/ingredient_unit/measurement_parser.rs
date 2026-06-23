use std::{collections::HashMap, error::Error, num::ParseFloatError};

use measurements::{Mass, Measurement, Volume};
use serde::Deserialize;

use crate::ingredient::Ingredient;

#[derive(Debug)]
pub enum ParsedMeasurement {
    Volume(Volume),
    Mass(Mass),
}

impl Measurement for ParsedMeasurement {
    fn get_base_units_name(&self) -> &'static str {
        match self {
            ParsedMeasurement::Volume(v) => Volume::get_base_units_name(v),
            ParsedMeasurement::Mass(m) => Mass::get_base_units_name(m),
        }
    }

    fn as_base_units(&self) -> f64 {
        match self {
            ParsedMeasurement::Volume(v) => v.as_base_units(),
            ParsedMeasurement::Mass(m) => m.as_base_units(),
        }
    }

    fn from_base_units(_units: f64) -> Self {
        unimplemented!()
    }
}

#[derive(Debug)]
pub enum ParsedMeasurementError {
    UnknownUnit(String),
    ParseUnitData(toml::de::Error),
    ParseFloat(ParseFloatError),
}

impl std::fmt::Display for ParsedMeasurementError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::UnknownUnit(u) => write!(f, "Unknown unit: {u}"),
            Self::ParseUnitData(e) => write!(f, "Failed to parse unit data: {e}"),
            Self::ParseFloat(e) => write!(f, "Failed to parse float: {e}"),
        }
    }
}

impl Error for ParsedMeasurementError {}

impl From<toml::de::Error> for ParsedMeasurementError {
    fn from(value: toml::de::Error) -> Self {
        ParsedMeasurementError::ParseUnitData(value)
    }
}

impl From<ParseFloatError> for ParsedMeasurementError {
    fn from(value: ParseFloatError) -> Self {
        ParsedMeasurementError::ParseFloat(value)
    }
}

#[derive(Debug, Deserialize)]
struct Unit {
    canonical: String,
    fuzzy: Vec<String>,
}

type Units = HashMap<String, Unit>;

fn canonical_from_fuzzy<'a>(
    units: &'a Units,
    input: &str,
) -> Result<&'a str, ParsedMeasurementError> {
    for unit in units.values() {
        if unit.fuzzy.iter().any(|f| f == input) || unit.canonical == input {
            return Ok(unit.canonical.as_str());
        }
    }
    Err(ParsedMeasurementError::UnknownUnit(format!(
        "unknown unit: {}",
        input
    )))
}

impl TryFrom<&Ingredient> for ParsedMeasurement {
    type Error = ParsedMeasurementError;

    fn try_from(value: &Ingredient) -> Result<Self, Self::Error> {
        let vol_toml = include_str!("volume.toml");
        let mass_toml = include_str!("mass.toml");
        let volume_units: Units = toml::from_str(vol_toml)?;
        let mass_units: Units = toml::from_str(mass_toml)?;

        match (
            canonical_from_fuzzy(&volume_units, value.unit.as_str()),
            canonical_from_fuzzy(&mass_units, value.unit.as_str()),
        ) {
            (Ok(u), Err(_)) => Ok(ParsedMeasurement::Volume(
                format!("{} {}", value.amount, u).parse::<Volume>()?,
            )),
            (Err(_), Ok(u)) => Ok(ParsedMeasurement::Mass(
                format!("{} {}", value.amount, u).parse::<Mass>()?,
            )),
            (Ok(_), Ok(_)) => Err(ParsedMeasurementError::UnknownUnit(format!(
                "ambiguous unit: {}",
                value.unit
            ))),
            (Err(_), Err(_)) => Err(ParsedMeasurementError::UnknownUnit(format!(
                "unknown unit: {}",
                value.unit
            ))),
        }
    }
}

#[cfg(test)]
mod tests {
    use measurements::{Mass, Measurement, Volume};

    use crate::{
        ingredient::Ingredient,
        ingredient_unit::measurement_parser::{ParsedMeasurement, ParsedMeasurementError},
    };

    fn ingredient(amount: f64, unit: &str) -> Ingredient {
        Ingredient::new("x", amount, unit)
    }

    fn approx_eq(a: f64, b: f64) -> bool {
        (a - b).abs() <= 1e-12 * b.abs().max(1.0)
    }

    // --- ParsedMeasurement: Measurement impl sanity ---

    #[test]
    fn parsed_measurement_volume_delegates_get_base_units_name() {
        let v: Volume = "1 ml".parse().unwrap();
        let pm = ParsedMeasurement::Volume(v.clone());

        assert_eq!(pm.get_base_units_name(), Volume::get_base_units_name(&v));
    }

    #[test]
    fn parsed_measurement_volume_delegates_as_base_units() {
        let v: Volume = "2 ml".parse().unwrap();
        let pm = ParsedMeasurement::Volume(v.clone());

        assert!(approx_eq(pm.as_base_units(), v.as_base_units()));
    }

    #[test]
    fn parsed_measurement_mass_delegates_get_base_units_name() {
        let m: Mass = "1 g".parse().unwrap();
        let pm = ParsedMeasurement::Mass(m.clone());

        assert_eq!(pm.get_base_units_name(), Mass::get_base_units_name(&m));
    }

    #[test]
    fn parsed_measurement_mass_delegates_as_base_units() {
        let m: Mass = "3 g".parse().unwrap();
        let pm = ParsedMeasurement::Mass(m.clone());

        assert!(approx_eq(pm.as_base_units(), m.as_base_units()));
    }

    // -- Unit conversion tests --

    #[test]
    fn canonical_unit_volume_parses() {
        let ing = ingredient(2.0, "tsp");

        let parsed = ParsedMeasurement::try_from(&ing).expect("should parse volume");
        assert!(matches!(parsed, ParsedMeasurement::Volume(_)));
    }

    #[test]
    fn canonical_unit_mass_parses() {
        let ing = ingredient(10.0, "g");

        let parsed = ParsedMeasurement::try_from(&ing).expect("should parse mass");
        assert!(matches!(parsed, ParsedMeasurement::Mass(_)));
    }

    #[test]
    fn fuzzy_unit_volume_parses() {
        let ing = ingredient(1.5, "tsps");

        let parsed = ParsedMeasurement::try_from(&ing).expect("should parse fuzzy volume");
        assert!(matches!(parsed, ParsedMeasurement::Volume(_)));
    }

    #[test]
    fn unknown_unit_returns_unknown_unit() {
        let ing = ingredient(1.0, "this_unit_does_not_exist");

        let err = ParsedMeasurement::try_from(&ing).unwrap_err();
        match err {
            ParsedMeasurementError::UnknownUnit(u) => assert!(u.contains("unknown unit")),
            other => panic!("expected UnknownUnit, got {other:?}"),
        }
    }

    #[test]
    fn invalid_amount_returns_parse_float_error() {
        // amount is an f64, so we test NaN which should fail parsing "<amount> <unit>" into Volume/Mass.
        let ing = ingredient(f64::NAN, "gram");

        let err = ParsedMeasurement::try_from(&ing).unwrap_err();
        match err {
            ParsedMeasurementError::ParseFloat(_) => {}
            other => panic!("expected ParseFloat, got {other:?}"),
        }
    }
}
