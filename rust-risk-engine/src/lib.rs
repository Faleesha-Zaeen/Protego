/// Calculates a simple aggregate risk score for a transaction scenario.
/// Each flag toggles a fixed number of points that reflect its severity.
pub fn calculate_risk(
    unlimited_approval: bool,
    large_transfer: bool,
    unknown_contract: bool,
) -> u32 {
    let mut score = 0;

    // Unlimited approvals expose user funds indefinitely.
    if unlimited_approval {
        score += 40;
    }

    // Large transfers suggest high-value movement worth extra scrutiny.
    if large_transfer {
        score += 30;
    }

    // Interacting with unknown contracts is inherently risky.
    if unknown_contract {
        score += 20;
    }

    score
}

#[cfg(test)]
mod tests {
    use super::calculate_risk;

    #[test]
    fn calculates_expected_scores() {
        assert_eq!(calculate_risk(false, false, false), 0);
        assert_eq!(calculate_risk(true, false, false), 40);
        assert_eq!(calculate_risk(false, true, false), 30);
        assert_eq!(calculate_risk(false, false, true), 20);
        assert_eq!(calculate_risk(true, true, true), 90);
        assert_eq!(calculate_risk(true, false, true), 60);
    }
}
