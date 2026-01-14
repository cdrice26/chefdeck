use crate::token_keyring::{self, AuthVaultError};

pub trait StringifyError<T> {
    fn string_err(self) -> Result<T, String>;
}

impl<T> StringifyError<T> for Result<T, sqlx::Error> {
    fn string_err(self) -> Result<T, String> {
        self.map_err(|e| e.to_string())
    }
}

impl<T> StringifyError<T> for Result<T, reqwest::Error> {
    fn string_err(self) -> Result<T, String> {
        self.map_err(|e| e.to_string())
    }
}

impl<T> StringifyError<T> for Result<T, std::env::VarError> {
    fn string_err(self) -> Result<T, String> {
        self.map_err(|e| e.to_string())
    }
}

impl<T> StringifyError<T> for Result<T, AuthVaultError> {
    fn string_err(self) -> Result<T, String> {
        self.map_err(|e| e.to_string())
    }
}

impl<T> StringifyError<T> for Result<T, std::io::Error> {
    fn string_err(self) -> Result<T, String> {
        self.map_err(|e| e.to_string())
    }
}
