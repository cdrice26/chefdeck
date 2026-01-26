/// Service name used for OS keyring entries.
const SERVICE_NAME: &str = "chefdeck";
/// Key under which the refresh token is stored in the keyring.
const REFRESH_TOKEN_KEY: &str = "refresh_token";

/// Local error type for auth vault operations.
#[derive(Debug)]
pub enum AuthVaultError {
    Keyring(keyring::Error),
    Io(std::io::Error),
}

impl std::fmt::Display for AuthVaultError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AuthVaultError::Keyring(e) => write!(f, "keyring error: {}", e),
            AuthVaultError::Io(e) => write!(f, "io error: {}", e),
        }
    }
}

impl std::error::Error for AuthVaultError {}

impl From<keyring::Error> for AuthVaultError {
    fn from(e: keyring::Error) -> Self {
        AuthVaultError::Keyring(e)
    }
}

impl From<std::io::Error> for AuthVaultError {
    fn from(e: std::io::Error) -> Self {
        AuthVaultError::Io(e)
    }
}

type Result<T> = std::result::Result<T, AuthVaultError>;

/// Store the refresh token in the OS keyring.
pub fn store_refresh_token(token: &str) -> Result<()> {
    let entry = keyring::Entry::new(SERVICE_NAME, REFRESH_TOKEN_KEY)?;
    entry.set_password(token)?;
    Ok(())
}

/// Retrieve the refresh token from the OS keyring, if present.
///
/// Returns `Ok(None)` when there is no stored token.
pub fn get_refresh_token() -> Result<Option<String>> {
    let entry = keyring::Entry::new(SERVICE_NAME, REFRESH_TOKEN_KEY)?;
    match entry.get_password() {
        Ok(pw) => Ok(Some(pw)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(AuthVaultError::Keyring(e)),
    }
}

/// Remove the refresh token from the OS keyring (e.g. during logout).
pub fn clear_refresh_token() -> Result<()> {
    let entry = keyring::Entry::new(SERVICE_NAME, REFRESH_TOKEN_KEY)?;
    match entry.delete_credential() {
        Ok(_) => Ok(()),
        Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(AuthVaultError::Keyring(e)),
    }
}
