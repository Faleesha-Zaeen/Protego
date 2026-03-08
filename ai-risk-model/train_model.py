import joblib
import pandas as pd
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

DATA_PATH = Path(__file__).resolve().parent / "dataset_labeled.csv"
MODEL_PATH = Path(__file__).resolve().parent / "model.pkl"


def load_dataset(path: Path) -> pd.DataFrame:
  if not path.exists():
    raise FileNotFoundError(f"Dataset not found at {path}")
  return pd.read_csv(path)


def train_model(df: pd.DataFrame) -> RandomForestClassifier:
  feature_cols = ["unlimited_approval", "large_transfer", "unknown_contract"]
  target_col = "risk_level"

  X = df[feature_cols]
  y = df[target_col]

  X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
  )

  model = RandomForestClassifier(
    n_estimators=200,
    max_depth=5,
    random_state=42,
    class_weight="balanced",
  )
  model.fit(X_train, y_train)

  y_pred = model.predict(X_test)
  accuracy = accuracy_score(y_test, y_pred)
  print(f"Validation accuracy: {accuracy:.4f}")

  return model


def main():
  df = load_dataset(DATA_PATH)
  model = train_model(df)
  joblib.dump(model, MODEL_PATH)
  print(f"Model saved to {MODEL_PATH}")


if __name__ == "__main__":
  main()
