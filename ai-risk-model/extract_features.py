#!/usr/bin/env python3
"""Transform raw Ethereum transactions into model-ready features."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Iterable, List

import pandas as pd

try:
  from dotenv import load_dotenv
except ImportError:  # pragma: no cover
  load_dotenv = None

PROJECT_ROOT = Path(__file__).resolve().parents[1]
RAW_DATA = Path(__file__).with_name("dataset_raw.csv")
FEATURE_DATA = Path(__file__).with_name("dataset.csv")

APPROVE_SELECTOR = "0x095ea7b3"
TRANSFER_SELECTOR = "0xa9059cbb"
LARGE_APPROVAL_THRESHOLD = 1e24  # ~1M tokens with 18 decimals
LARGE_TRANSFER_THRESHOLD_ETH = 50  # adjust for hackathon experiments
KNOWN_CONTRACTS: List[str] = [
  "0xdAC17F958D2ee523a2206206994597C13D831ec7",  # USDT
  "0x7a250d5630b4cf539739df2c5dacab4c659f2488",  # Uniswap Router
  "0x6b175474e89094c44da98b954eedeac495271d0f",  # DAI
]
SAFE_CONTRACTS = [addr.lower() for addr in KNOWN_CONTRACTS]


def load_env() -> None:
  if load_dotenv:
    load_dotenv(PROJECT_ROOT / ".env")


def safe_hex_to_int(value: str) -> int:
  if not isinstance(value, str):
    return 0
  value = value.lower()
  if value.startswith("0x"):
    try:
      return int(value, 16)
    except ValueError:
      return 0
  try:
    return int(value)
  except ValueError:
    return 0


def extract_method(input_data: str) -> str:
  if isinstance(input_data, str) and len(input_data) >= 10 and input_data.startswith("0x"):
    return input_data[:10].lower()
  return ""


def decode_approval_amount(input_data: str) -> float:
  if not isinstance(input_data, str) or len(input_data) < 138:
    return 0.0
  if not input_data.startswith(APPROVE_SELECTOR):
    return 0.0
  raw_amount = input_data[-64:]
  amount_int = safe_hex_to_int(f"0x{raw_amount}")
  return float(amount_int)


def main() -> None:
  load_env()
  if not RAW_DATA.exists():
    raise SystemExit(f"Missing {RAW_DATA}. Run collect_transactions.py first.")

  df = pd.read_csv(RAW_DATA)

  df["input"] = df["input"].fillna("0x")
  df["to"] = df["to"].fillna("")
  df["value_eth"] = df.get("value_eth", 0).fillna(0.0)

  df["method"] = df["input"].apply(extract_method)

  df["approval_amount"] = df["input"].apply(decode_approval_amount)

  df["unlimited_approval"] = (
    (df["method"] == APPROVE_SELECTOR) & (df["approval_amount"] >= LARGE_APPROVAL_THRESHOLD)
  ).astype(int)

  df["large_transfer"] = (df["value_eth"] >= LARGE_TRANSFER_THRESHOLD_ETH).astype(int)

  df["token_transfer"] = (df["method"] == TRANSFER_SELECTOR).astype(int)

  df["unknown_contract"] = (~df["to"].str.lower().isin(SAFE_CONTRACTS)).astype(int)

  feature_cols = [
    "label",
    "hash",
    "unlimited_approval",
    "large_transfer",
    "unknown_contract",
    "token_transfer",
    "approval_amount",
    "value_eth",
    "method",
    "to",
  ]

  feature_df = df[feature_cols].copy()
  feature_df.to_csv(FEATURE_DATA, index=False)
  print(f"Saved features to {FEATURE_DATA} ({len(feature_df)} rows).")


if __name__ == "__main__":
  main()
