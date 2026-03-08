#!/usr/bin/env python3
"""Assign heuristic risk labels to engineered blockchain features."""

from __future__ import annotations

from pathlib import Path

import pandas as pd

INPUT_PATH = Path(__file__).with_name("dataset.csv")
OUTPUT_PATH = Path(__file__).with_name("dataset_labeled.csv")


def compute_risk_level(row: pd.Series) -> int:
  if row.get("unlimited_approval", 0) == 1:
    return 2
  if row.get("large_transfer", 0) == 1 and row.get("unknown_contract", 0) == 1:
    return 2
  if row.get("large_transfer", 0) == 1:
    return 1
  return 0


def main() -> None:
  if not INPUT_PATH.exists():
    raise SystemExit(f"Missing {INPUT_PATH}. Run extract_features.py first.")

  df = pd.read_csv(INPUT_PATH).fillna(0)
  df["risk_level"] = df.apply(compute_risk_level, axis=1)
  df.to_csv(OUTPUT_PATH, index=False)
  print(f"Saved labeled dataset to {OUTPUT_PATH} ({len(df)} rows).")


if __name__ == "__main__":
  main()
