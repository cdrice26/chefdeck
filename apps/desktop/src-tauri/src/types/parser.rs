/// Trait for parsing data from one type to another.
pub trait Parsable {
    /// Type to convert to.
    type Output;

    /// Type to convert from.
    type Context;

    /// Parses the data from the given context.
    fn parse(self, context: Self::Context) -> Result<Self::Output, sqlx::Error>;
}
