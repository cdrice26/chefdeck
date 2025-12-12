pub trait StringifySqlxError<T> {
    fn string_err(self) -> Result<T, String>;
}

impl<T> StringifySqlxError<T> for Result<T, sqlx::Error> {
    fn string_err(self) -> Result<T, String> {
        self.map_err(|e| e.to_string())
    }
}
