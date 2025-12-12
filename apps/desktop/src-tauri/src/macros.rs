macro_rules! run_tx {
    ($db:expr, $op:expr) => {{
        let mut tx = $db.begin().await.string_err()?;
        let result = $op(&mut tx).await.string_err();
        tx.commit().await.string_err()?;
        result
    }};
}

pub(crate) use run_tx;
