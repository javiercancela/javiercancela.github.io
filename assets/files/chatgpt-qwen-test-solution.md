Implemented in the canvas as `workflow.py`.

What it does:

* validates the DAG and rejects cycles
* runs independent steps in parallel with `ThreadPoolExecutor`
* supports retries with exponential backoff
* enforces per-step timeout
* supports cancellation via `cancel <run_id>`
* persists every transition to append-only `events.jsonl`
* reconstructs state only from the event log
* skips already `SUCCEEDED` steps after restart
* marks downstream steps `SKIPPED` when an upstream step fails permanently
* terminates running subprocesses on cancellation
* supports deterministic replay of the persisted event stream

CLI:

```bash
python workflow.py run workflow.json
python workflow.py status <run_id>
python workflow.py cancel <run_id>
python workflow.py replay <run_id>
```

Extra commands I added because restart/resume is otherwise incomplete:

```bash
python workflow.py resume <run_id>
python workflow.py resume-all
```

Important design points:

* The event log is line-delimited JSON and written with append + flush + `fsync`, so abrupt termination should not corrupt prior events.
* The workflow JSON is copied into `runs/<run_id>/workflow.json` so replay/recovery uses the exact workflow definition for that run.
* On crash recovery, `RUNNING` and `READY` steps are normalized back to `PENDING`, then re-derived from the event log. `SUCCEEDED` steps are never rerun.
* Cancellation is requested by creating `runs/<run_id>/cancel.request`, which avoids cross-process locking complexity.
* Race conditions are reduced by:

  * one in-process lock around state mutation and event emission
  * append-only event writes serialized by the event log lock
  * only the scheduler thread deciding what to submit
  * worker threads only executing already-assigned steps

One caveat:

* If the process crashes while a step is running, the engine cannot prove whether that external command completed successfully unless it had already persisted `SUCCEEDED`. So interrupted `RUNNING` steps are retried on resume. That is the safe choice, but it means step commands should ideally be idempotent.

If you want, I can also produce:

* a small `tasks/` demo set to test it end-to-end
* a review of this solution as if grading a model answer
* a stricter version with per-step stdout/stderr capture in the event log or sidecar files
