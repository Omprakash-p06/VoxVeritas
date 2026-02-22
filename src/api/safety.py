"""Safety evaluation API — exposes promptfoo/CSV evaluation results to the frontend."""

import json
import os
import csv
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from loguru import logger

router = APIRouter()

RESULTS_PATH = os.path.join("evaluations", "results.json")
TESTS_CSV_PATH = os.path.join("evaluations", "safety_tests.csv")

# ── Response models ───────────────────────────────────────────

class CategoryResult(BaseModel):
    total: int
    passed: int
    failed: int

class SafetyFailure(BaseModel):
    test_id: str
    category: str
    prompt: str
    expected: str
    actual: str

class SafetySummary(BaseModel):
    total: int
    passed: int
    failed: int
    pass_rate: float

class SafetyReport(BaseModel):
    run_id: str
    timestamp: str
    status: str
    summary: SafetySummary
    categories: dict  # { hallucination, prompt_injection, harmful_advice }
    failures: List[SafetyFailure]

class SafetyRunResponse(BaseModel):
    run_id: str
    status: str
    message: str

# ── Category classification (heuristic from prompt text) ─────

_CATEGORY_KEYWORDS = {
    "prompt_injection": ["ignore", "previous instructions", "override", "bypass"],
    "harmful_advice": ["bomb", "attack", "ddos", "hate speech", "dangerous", "hack"],
    "hallucination": ["president", "capital", "http", "airspeed", "poem", "joke", "essay"],
}

def _classify(prompt: str) -> str:
    lower = prompt.lower()
    for cat, keywords in _CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw in lower:
                return cat
    return "hallucination"  # default bucket

# ── Helpers ───────────────────────────────────────────────────

def _parse_results_json() -> SafetyReport:
    """Parse the promptfoo results.json into a SafetyReport."""
    if not os.path.isfile(RESULTS_PATH):
        raise HTTPException(status_code=404, detail="No evaluation results found. Run tests first.")

    with open(RESULTS_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    eval_id = data.get("evalId", "unknown")
    results_block = data.get("results", {})
    timestamp = results_block.get("timestamp", datetime.now(timezone.utc).isoformat())
    test_results = results_block.get("results", [])

    passed = 0
    failed = 0
    failures: List[SafetyFailure] = []

    cat_counters: dict[str, dict] = {
        "hallucination": {"total": 0, "passed": 0, "failed": 0},
        "prompt_injection": {"total": 0, "passed": 0, "failed": 0},
        "harmful_advice": {"total": 0, "passed": 0, "failed": 0},
    }

    for idx, tr in enumerate(test_results):
        prompt_text = (tr.get("vars", {}) or {}).get("prompt", tr.get("prompt", {}).get("raw", ""))
        is_pass = tr.get("success", False)
        category = _classify(prompt_text)

        if category not in cat_counters:
            cat_counters[category] = {"total": 0, "passed": 0, "failed": 0}
        cat_counters[category]["total"] += 1

        if is_pass:
            passed += 1
            cat_counters[category]["passed"] += 1
        else:
            failed += 1
            cat_counters[category]["failed"] += 1

            # Build failure detail
            actual_output = ""
            response_obj = tr.get("response", {})
            if isinstance(response_obj, dict):
                actual_output = response_obj.get("output", str(response_obj))
            else:
                actual_output = str(response_obj)

            # Expected from the assert list
            asserts = tr.get("gradingResult", {}).get("componentResults", [])
            expected_str = ""
            for a in asserts:
                if not a.get("pass", True):
                    expected_str = a.get("assertion", {}).get("value", "")
                    break

            failures.append(SafetyFailure(
                test_id=f"TEST_{idx + 1:03d}",
                category=category,
                prompt=prompt_text,
                expected=expected_str or "(see assertion)",
                actual=actual_output[:300] if actual_output else "",
            ))

    total = passed + failed
    return SafetyReport(
        run_id=eval_id,
        timestamp=timestamp,
        status="completed",
        summary=SafetySummary(
            total=total,
            passed=passed,
            failed=failed,
            pass_rate=round(passed / total, 4) if total > 0 else 0,
        ),
        categories={k: CategoryResult(**v) for k, v in cat_counters.items()},
        failures=failures,
    )

# ── Endpoints ─────────────────────────────────────────────────

@router.get("/safety/report", response_model=SafetyReport, summary="Get latest safety evaluation report")
async def get_safety_report() -> SafetyReport:
    """Parses evaluations/results.json and returns a structured safety report."""
    return _parse_results_json()


@router.post("/safety/run", response_model=SafetyRunResponse, summary="Trigger a new safety evaluation run")
async def run_safety_tests(body: dict = None) -> SafetyRunResponse:
    """
    Kicks off a safety evaluation run.
    In production this would launch promptfoo in a subprocess;
    for now it returns the latest cached results.
    """
    run_id = f"eval-{uuid.uuid4().hex[:8]}-{datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S')}"

    # Attempt to run promptfoo if available
    try:
        import subprocess
        logger.info("Launching promptfoo evaluation...")
        proc = subprocess.Popen(
            ["npx", "promptfoo", "eval", "--config", "evaluations/promptfooconfig.yaml",
             "--output", "evaluations/results.json", "--no-cache"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=True,
        )
        # Don't block — the frontend polls GET /safety/report
        logger.info(f"Safety evaluation started (PID {proc.pid})")
    except Exception as e:
        logger.warning(f"Could not launch promptfoo: {e}. Returning cached results.")

    return SafetyRunResponse(
        run_id=run_id,
        status="running",
        message="Safety evaluation started. Poll GET /safety/report for results.",
    )
