use chrono::{Datelike, Duration, NaiveDate, Weekday};

/// Returns which occurrence of its weekday this date is within its month (1-indexed).
/// e.g. the 2nd Tuesday → 2
pub fn week_of_month(date: NaiveDate) -> u32 {
    ((date.day() - 1) / 7) + 1
}

/// Given a date, find the same Nth weekday-of-month in the following month.
pub fn next_monthly_day_occurrence(
    date: NaiveDate,
    weekday: Weekday,
    nth: u32,
) -> Option<NaiveDate> {
    let next_month = add_months(date, 1)?;
    // Find the first occurrence of `weekday` in that month
    let first_of_month = NaiveDate::from_ymd_opt(next_month.year(), next_month.month(), 1)?;
    let days_until = (weekday.num_days_from_monday() as i64
        - first_of_month.weekday().num_days_from_monday() as i64)
        .rem_euclid(7);
    let first_occurrence = first_of_month + Duration::days(days_until);
    let candidate = first_occurrence + Duration::weeks((nth - 1) as i64);
    // Ensure we haven't spilled into the next month
    if candidate.month() == next_month.month() {
        Some(candidate)
    } else {
        None
    }
}

/// Add `months` months to a NaiveDate, clamping to the last day of the target month.
pub fn add_months(date: NaiveDate, months: u32) -> Option<NaiveDate> {
    let total_months = date.month() as u32 + months;
    let year = date.year() + (total_months as i32 - 1) / 12;
    let month = ((total_months - 1) % 12) + 1;
    let day = date.day();
    // Try exact day first, then clamp to end of month
    NaiveDate::from_ymd_opt(year, month, day)
        .or_else(|| NaiveDate::from_ymd_opt(year, month + 1, 0)) // day 0 of next month = last day of current
}
