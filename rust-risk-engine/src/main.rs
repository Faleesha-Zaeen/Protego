use rust_risk_engine::assess_risk;

fn parse_flag(arg: &str) -> bool {
    match arg.to_ascii_lowercase().as_str() {
        "true" => true,
        "false" => false,
        other => panic!("Invalid flag value '{}'. Use true or false.", other),
    }
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.len() != 4 {
        eprintln!("Usage: cargo run <unlimited_approval> <large_transfer> <unknown_contract>");
        std::process::exit(1);
    }

    let unlimited_approval = parse_flag(&args[1]);
    let large_transfer = parse_flag(&args[2]);
    let unknown_contract = parse_flag(&args[3]);

    let score = assess_risk(unlimited_approval, large_transfer, unknown_contract);
    println!("Risk score: {}", score);
}
