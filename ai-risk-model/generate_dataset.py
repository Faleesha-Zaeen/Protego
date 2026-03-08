import csv
import random
from pathlib import Path

DATASET_PATH = Path(__file__).resolve().parent / "dataset.csv"

rows = []
for _ in range(650):
    unlimited = random.randint(0, 1)
    large_transfer = random.randint(0, 1)
    unknown = random.randint(0, 1)

    if unlimited and unknown:
        risk = 2
    elif large_transfer and unknown:
        risk = random.choice([1, 2])
    elif unlimited or large_transfer or unknown:
        risk = 1 if (unknown or large_transfer) else 0
    else:
        risk = 0

    rows.append((unlimited, large_transfer, unknown, risk))

with DATASET_PATH.open("w", newline="") as fh:
    writer = csv.writer(fh)
    writer.writerow(["unlimited_approval", "large_transfer", "unknown_contract", "risk_level"])
    writer.writerows(rows)

print(f"Wrote {len(rows)} rows to {DATASET_PATH}")
