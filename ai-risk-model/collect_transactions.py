#!/usr/bin/env python3
"""Collect recent Ethereum transactions for well-known contracts using Etherscan.

The script fetches paginated transaction lists for a curated set of contract
addresses and saves a consolidated CSV (dataset_raw.csv) with the following
fields: tx hash, from/to addresses, input data, value (in ETH), contract
address, and method selector. It targets ~5k rows for richer downstream model
training.
"""

from __future__ import annotations

import os
import sys
import time
from pathlib import Path
from typing import Dict, List

import pandas as pd
import requests

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - optional dependency
    load_dotenv = None

ETHERSCAN_API_URL = "https://api.etherscan.io/v2/api"
API_KEY_ENV = "ETHERSCAN_API_KEY"
DEFAULT_TARGET_ROWS = 4800
PAGE_SIZE = 100  # Etherscan max for free tier
RATE_LIMIT_SECONDS = 0.25  # stay below 5 req/sec cap

CONTRACTS: Dict[str, str] = {
    "USDT": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "UNISWAP_ROUTER": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    "DAI": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
}


def get_api_key() -> str:
    if load_dotenv:
        # Load variables from project root .env so CLI usage matches backend setup
        project_root = Path(__file__).resolve().parents[1]
        load_dotenv(project_root / ".env")

    api_key = os.getenv(API_KEY_ENV)
    if not api_key:
        raise SystemExit(
            f"Missing {API_KEY_ENV}. Please export your Etherscan API key before running."
        )
    return api_key


def fetch_transactions(address: str, api_key: str, target_rows: int) -> List[dict]:
    collected: List[dict] = []
    page = 1

    while len(collected) < target_rows:
        params = {
            "module": "account",
            "action": "txlist",
            "address": address,
            "startblock": 0,
            "endblock": 99999999,
            "page": page,
            "offset": PAGE_SIZE,
            "sort": "desc",
            "chainid": 1,
            "apikey": api_key,
        }

        resp = requests.get(ETHERSCAN_API_URL, params=params, timeout=30)
        resp.raise_for_status()
        payload = resp.json()

        if payload.get("status") != "1" or not payload.get("result"):
            message = payload.get("message", "Unknown error")
            result_details = payload.get("result")
            print(
                f"[collector] Stopping pagination for {address}: status={payload.get('status')} message='{message}' result={result_details}"
            )
            break

        batch = payload["result"]
        collected.extend(batch)

        if len(batch) < PAGE_SIZE:
            # Last page
            break

        page += 1
        time.sleep(RATE_LIMIT_SECONDS)

    return collected[:target_rows]


def normalize_record(raw: dict, label: str) -> dict:
    method_sig = (raw.get("input") or "0x")[:10]
    value_eth = int(raw.get("value", "0")) / 1e18

    return {
        "label": label,
        "hash": raw.get("hash"),
        "from": raw.get("from"),
        "to": raw.get("to"),
        "contractAddress": raw.get("to"),
        "value_eth": value_eth,
        "input": raw.get("input"),
        "method": method_sig,
        "blockNumber": raw.get("blockNumber"),
        "timeStamp": raw.get("timeStamp"),
        "isError": raw.get("isError"),
    }


def main(target_rows: int = DEFAULT_TARGET_ROWS) -> None:
    api_key = get_api_key()

    per_contract_target = max(target_rows // len(CONTRACTS), PAGE_SIZE)
    normalized_rows: List[dict] = []

    for label, address in CONTRACTS.items():
        print(f"[collector] Fetching transactions for {label} ({address})...", flush=True)
        try:
            records = fetch_transactions(address, api_key, per_contract_target)
        except requests.HTTPError as http_err:
            print(f"[collector] HTTP error for {label}: {http_err}", file=sys.stderr)
            continue
        except Exception as err:  # noqa: BLE001
            print(f"[collector] Unexpected error for {label}: {err}", file=sys.stderr)
            continue

        print(f"[collector] Retrieved {len(records)} rows for {label}.")
        normalized_rows.extend(normalize_record(r, label) for r in records)

    if not normalized_rows:
        raise SystemExit("No transactions were collected. Aborting.")

    df = pd.DataFrame(normalized_rows)
    output_path = os.path.join(os.path.dirname(__file__), "dataset_raw.csv")
    df.to_csv(output_path, index=False)

    print(
        f"[collector] Saved {len(df)} transactions to {output_path}."
        " Consider rerunning with a higher target if needed."
    )


if __name__ == "__main__":
    rows = DEFAULT_TARGET_ROWS
    if len(sys.argv) > 1:
        try:
            rows = max(int(sys.argv[1]), PAGE_SIZE)
        except ValueError:
            print("Invalid row count provided; using default.")
    main(rows)
