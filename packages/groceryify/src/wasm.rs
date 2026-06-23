use crate::ingredient::Ingredient;
#[cfg(feature = "wasm")]
use wasm_bindgen::prelude::*;

#[cfg(feature = "wasm")]
#[wasm_bindgen]
pub fn merge(val: JsValue) -> Result<JsValue, JsValue> {
    let ingredients: Vec<Ingredient> =
        serde_wasm_bindgen::from_value(val).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let result = crate::merge(&ingredients);
    serde_wasm_bindgen::to_value(&result).map_err(|e| JsValue::from_str(&e.to_string()))
}
