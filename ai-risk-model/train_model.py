import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

OUTPUT_DIR = Path(__file__).resolve().parent
MODEL_PATH = OUTPUT_DIR / "model.pkl"
SCALER_PATH = OUTPUT_DIR / "scaler.pkl"

RNG = np.random.default_rng(42)


def generate_data(num_samples: int) -> pd.DataFrame:
  unlimited_approval = RNG.integers(0, 2, size=num_samples)
  large_transfer = RNG.integers(0, 2, size=num_samples)
  unknown_contract = RNG.integers(0, 2, size=num_samples)
  token_transfer = RNG.integers(0, 2, size=num_samples)
  approval_amount = RNG.uniform(0, 1e18, size=num_samples)
  approval_amount += RNG.normal(0, 1e16, size=num_samples)
  approval_amount = np.clip(approval_amount, 0, 1e18)
  approval_amount_norm = approval_amount / 1e18

  data = pd.DataFrame(
    {
      "unlimited_approval": unlimited_approval,
      "large_transfer": large_transfer,
      "unknown_contract": unknown_contract,
      "token_transfer": token_transfer,
      "approval_amount_norm": approval_amount_norm,
    }
  )

  malicious = (
    (data["unlimited_approval"] == 1) & (data["unknown_contract"] == 1)
  ) | (
    (data["approval_amount_norm"] > 0.5) & (data["unknown_contract"] == 1)
  ) | (
    (data["large_transfer"] == 1) & (data["unknown_contract"] == 1)
  )

  labels = malicious.astype(int)
  flip_mask = RNG.random(num_samples) < 0.05
  labels[flip_mask] = 1 - labels[flip_mask]
  data["label"] = labels
  return data


def main() -> None:
  data = generate_data(10000)
  features = data[
    [
      "unlimited_approval",
      "large_transfer",
      "unknown_contract",
      "token_transfer",
      "approval_amount_norm",
    ]
  ]
  labels = data["label"]

  x_train, x_test, y_train, y_test = train_test_split(
    features, labels, test_size=0.2, random_state=42, stratify=labels
  )

  scaler = StandardScaler()
  x_train_scaled = scaler.fit_transform(x_train)
  x_test_scaled = scaler.transform(x_test)

  model = LogisticRegression(max_iter=1000)
  model.fit(x_train_scaled, y_train)

  accuracy = model.score(x_test_scaled, y_test)

  joblib.dump(model, MODEL_PATH)
  joblib.dump(scaler, SCALER_PATH)

  print(f"Model trained. Accuracy: {accuracy:.2f}")


if __name__ == "__main__":
  main()
