import argparse
import joblib
import pandas as pd
from pathlib import Path

MODEL_PATH = Path(__file__).resolve().parent / "model.pkl"

RISK_LABELS = {0: "LOW", 1: "MEDIUM", 2: "HIGH"}
RISK_SCORES = {0: 20, 1: 50, 2: 80}


def load_model(path: Path):
  if not path.exists():
    raise FileNotFoundError(
      "model.pkl not found. Train the model first by running train_model.py"
    )
  return joblib.load(path)


def parse_args():
  parser = argparse.ArgumentParser(description="Predict blockchain risk level")
  parser.add_argument("unlimited_approval", type=int, choices=[0, 1])
  parser.add_argument("large_transfer", type=int, choices=[0, 1])
  parser.add_argument("unknown_contract", type=int, choices=[0, 1])
  parser.add_argument("token_transfer", type=int, choices=[0, 1])
  parser.add_argument("approval_amount", type=float)
  return parser.parse_args()


def main():
  args = parse_args()
  model = load_model(MODEL_PATH)

  features = pd.DataFrame(
    [
      {
        "unlimited_approval": args.unlimited_approval,
        "large_transfer": args.large_transfer,
        "unknown_contract": args.unknown_contract,
      }
    ]
  )

  prediction = int(model.predict(features)[0])
  label = RISK_LABELS.get(prediction, "UNKNOWN")
  score = RISK_SCORES.get(prediction, 0)
  print(f"Risk Score: {score}")
  print(f"Risk Level: {label}")


if __name__ == "__main__":
  main()
