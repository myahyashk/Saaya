#!/usr/bin/env python3
"""Smoke-test the public Saaya API endpoints and report status and latency."""

import argparse
import os
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


LAT = 27.5295
LON = 68.7592
LANG = "en"

ENDPOINTS = [
    ("/api/health", {}),
    ("/api/locations", {}),
    ("/api/weather", {"lat": LAT, "lon": LON, "lang": LANG}),
    ("/api/risk", {"lat": LAT, "lon": LON, "lang": LANG}),
    ("/api/guidance", {"lat": LAT, "lon": LON, "lang": LANG}),
    ("/api/notifications", {"lat": LAT, "lon": LON, "lang": LANG}),
    ("/api/resources", {"lat": LAT, "lon": LON, "limit": 100}),
    ("/api/risk/cities", {}),
    ("/api/methodology", {"lang": LANG}),
]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--base-url",
        default=os.getenv("VITE_API_BASE_URL", "http://localhost:8000"),
        help="Backend base URL (default: VITE_API_BASE_URL or http://localhost:8000)",
    )
    parser.add_argument("--timeout", type=float, default=10, help="Request timeout in seconds")
    args = parser.parse_args()
    base_url = args.base_url.rstrip("/")
    failed = False

    for path, params in ENDPOINTS:
        query = f"?{urlencode(params)}" if params else ""
        url = f"{base_url}{path}{query}"
        started = time.perf_counter()
        status = 0
        detail = ""
        try:
            request = Request(url, headers={"Accept": "application/json"})
            with urlopen(request, timeout=args.timeout) as response:
                status = response.status
                response.read()
        except HTTPError as error:
            status = error.code
            detail = error.read().decode("utf-8", errors="replace").strip()
        except (URLError, TimeoutError, OSError) as error:
            detail = str(getattr(error, "reason", error))

        elapsed_ms = (time.perf_counter() - started) * 1000
        result = "PASS" if 200 <= status < 300 else "FAIL"
        print(f"{result} {status or 'NETWORK'} {elapsed_ms:.0f} ms {path}{query}")
        if detail:
            print(f"  {detail}")
        failed |= result == "FAIL"

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())