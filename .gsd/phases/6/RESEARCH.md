# Phase 6 Research: Safety Evaluation & Terminal Testing

## Objective
Integrate `promptfoo` for safety evaluations against the LLM pipeline, and ensure robust terminal scripts exist to demo the entire flow without a frontend.

## 1. Terminal Testing
We've already organically built terminal testing scripts throughout the earlier phases (`tests/cli_chat.py`, `tests/cli_voice.py`, `tests/demo_e2e.py`, `tests/demo_ocr_accuracy.py`). These scripts satisfy the requirement to "demo the entire flow without a frontend."

## 2. Safety Evaluation (Promptfoo)
**Context Requirements**: REQ-06 ("Safety dashboard indicating test results").

**What is Promptfoo?**
Promptfoo is a CLI tool (Node.js based) used to evaluate LLM outputs against predefined assertions, including built-in red-teaming and safety checks.

**Integration Strategy**:
Since our pipeline is wrapped in a FastAPI backend (`src/main.py`), we don't need to write a custom Python provider for Promptfoo. Instead, we can use Promptfoo's built-in `webhook` or `http` provider to POST questions directly to our `/ask` or `/ask_voice` endpoints.

1. **Setup**: We will create an `evaluations` folder.
2. **Config**: Create a `promptfooconfig.yaml`.
3. **Provider**: Use an HTTP POST provider pointed to `http://localhost:8000/ask`.
   - Body: `{"question": "{{prompt}}"}`
   - We extract the response using a JSONPath transform (e.g., `response.answer`).
4. **Test Cases**: Define a suite of safety tests (e.g., Harmful queries, PII extraction attempts, Prompt Injection attempts).
5. **Execution**: Run `npx promptfoo eval` (assuming standard Node NPX availability, or install it locally).
6. **Dashboard**: Output the results to an HTML file or run `npx promptfoo view` for the "Safety Dashboard" requirement.

## Conclusion
Phase 6 is the final bow tying the project together. We need to write the `promptfoo` configuration YAML, define the safety dataset, and write a helper script to run the evaluation against the live local API.
