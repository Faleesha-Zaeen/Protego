import argparse
import joblib
import pandas as pd
from pathlib import Path

MODEL_PATH = Path(__file__).resolve().parent / "model.pkl"
SCALER_PATH = Path(__file__).resolve().parent / "scaler.pkl"


def load_artifacts():
  if not MODEL_PATH.exists():
    raise FileNotFoundError(
      "model.pkl not found. Train the model first by running train_model.py"
    )
  if not SCALER_PATH.exists():
    raise FileNotFoundError(
      "scaler.pkl not found. Train the model first by running train_model.py"
    )
  return joblib.load(MODEL_PATH), joblib.load(SCALER_PATH)


def parse_args():
  parser = argparse.ArgumentParser(description="Predict blockchain risk score")
  parser.add_argument("unlimited_approval", type=int, choices=[0, 1])
  parser.add_argument("large_transfer", type=int, choices=[0, 1])
  parser.add_argument("unknown_contract", type=int, choices=[0, 1])
  parser.add_argument("token_transfer", type=int, choices=[0, 1])
  parser.add_argument("approval_amount", type=float)
  return parser.parse_args()


def score_to_level(score: int) -> str:
  if score > 70:
    return "HIGH"
  if score >= 40:
    return "MEDIUM"
  return "LOW"


def main():
  args = parse_args()
  model, scaler = load_artifacts()

  approval_amount_norm = args.approval_amount / 1e18

  features = pd.DataFrame(
    [
      {
        "unlimited_approval": args.unlimited_approval,
        "large_transfer": args.large_transfer,
        "unknown_contract": args.unknown_contract,
        "token_transfer": args.token_transfer,
        "approval_amount_norm": approval_amount_norm,
      }
    ]
  )

  features_scaled = scaler.transform(features)
  probability = float(model.predict_proba(features_scaled)[0][1])
  score = int(round(probability * 60))

  if args.unlimited_approval == 1:
    score += 20
  if args.unknown_contract == 1:
    score += 15
  if args.large_transfer == 1:
    score += 10
  if args.token_transfer == 1:
    score += 5

  if score > 100:
    score = 100

  print(f"Risk Score: {score}")
  print(f"Risk Level: {score_to_level(score)}")


if __name__ == "__main__":
  main()
