pub trait Parsable {
    type Output;
    type Context;

    fn parse(self, context: Self::Context) -> Result<Self::Output, sqlx::Error>;
}
