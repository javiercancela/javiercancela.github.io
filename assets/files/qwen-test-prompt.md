## Problem: build a mini event-sourced workflow engine

Implement a small local workflow engine in Python.

### Requirements

Create a library and CLI that can execute workflows defined as DAGs of steps.

Each workflow run must support:

* step dependencies
* parallel execution of independent steps
* retries with exponential backoff
* per-step timeout
* run cancellation
* persistence of all state transitions to disk
* restart after process crash, resuming unfinished work correctly
* deterministic replay from the persisted event log

### Input

A workflow is defined in JSON like this:

```json
{
  "workflow_id": "image_pipeline",
  "steps": [
    {
      "id": "download",
      "command": "python tasks/download.py",
      "depends_on": [],
      "retries": 2,
      "timeout_sec": 30
    },
    {
      "id": "preprocess",
      "command": "python tasks/preprocess.py",
      "depends_on": ["download"],
      "retries": 1,
      "timeout_sec": 20
    },
    {
      "id": "embed",
      "command": "python tasks/embed.py",
      "depends_on": ["preprocess"],
      "retries": 1,
      "timeout_sec": 60
    },
    {
      "id": "classify",
      "command": "python tasks/classify.py",
      "depends_on": ["preprocess"],
      "retries": 1,
      "timeout_sec": 60
    },
    {
      "id": "publish",
      "command": "python tasks/publish.py",
      "depends_on": ["embed", "classify"],
      "retries": 0,
      "timeout_sec": 15
    }
  ]
}
```

### Expected behavior

The engine should:

* validate the DAG and reject cycles
* execute ready steps concurrently
* track step states:

  * `PENDING`
  * `READY`
  * `RUNNING`
  * `SUCCEEDED`
  * `FAILED`
  * `SKIPPED`
  * `CANCELLED`
* write every state transition as an append-only event log on disk
* on restart, reconstruct workflow state only from the event log
* avoid rerunning steps already marked `SUCCEEDED`
* retry failed steps until retry limit is exhausted
* mark downstream steps as `SKIPPED` if dependencies failed permanently
* allow `cancel <run_id>` from the CLI
* if cancellation happens, running subprocesses should be terminated cleanly

### CLI

Provide:

```bash
python workflow.py run workflow.json
python workflow.py status <run_id>
python workflow.py cancel <run_id>
python workflow.py replay <run_id>
```

### Constraints

* use only the Python standard library
* code should run on Linux and macOS
* event log format must be line-delimited JSON
* the engine must tolerate abrupt termination without corrupting the run state
* the design should make race conditions unlikely and explain how

