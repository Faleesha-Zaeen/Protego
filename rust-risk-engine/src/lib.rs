
#![no_std]

pub fn assess_risk(
    has_unlimited_approval: bool,
    has_large_transfer: bool,
    has_unknown_contract: bool,
) -> u8 {
    let mut score: u8 = 0;
    if has_unlimited_approval { score = score.saturating_add(40); }
    if has_large_transfer { score = score.saturating_add(30); }
    if has_unknown_contract { score = score.saturating_add(20); }
    if score > 100 { return 100; }
    score
}

pub fn detect_anomaly(score: u8) -> &'static str {
    match score {
        0..=30 => "LOW",
        31..=70 => "MEDIUM",
        _ => "HIGH",
    }
}

#[cfg(test)]
mod tests {
    use super::assess_risk;

    #[test]
    fn calculates_expected_scores() {
        assert_eq!(assess_risk(false, false, false), 0);
        assert_eq!(assess_risk(true, false, false), 40);
        assert_eq!(assess_risk(false, true, false), 30);
        assert_eq!(assess_risk(false, false, true), 20);
        assert_eq!(assess_risk(true, true, true), 90);
        assert_eq!(assess_risk(true, false, true), 60);
    }
}
