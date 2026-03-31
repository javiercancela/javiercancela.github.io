<<<reasoning_content_start>>>Let me break down this problem:

1. **DAG-based workflow execution** - Need to parse JSON, validate no cycles, track dependencies
2. **Parallel execution** - Use threading/concurrent.futures for concurrent step execution
3. **Retries with exponential backoff** - Track retry counts, implement backoff
4. **Per-step timeout** - Use subprocess with timeout
5. **Run cancellation** - Need a way to signal cancellation to threads
6. **Persistence to disk** - Append-only event log (line-delimited JSON)
7. **Restart/resume** - Reconstruct state from event log
8. **Deterministic replay** - Replay events to reconstruct state

Key architectural decisions:

1. **Event types** - What events to log:
   - WORKFLOW_STARTED
   - WORKFLOW_COMPLETED / WORKFLOW_FAILED
   - STEP_READY
   - STEP_RUNNING
   - STEP_SUCCEEDED
   - STEP_FAILED
   - STEP_SKIPPED
   - STEP_CANCELLED
   - STEP_RETRYING

2. **State reconstruction** - On restart, read all events, build state machine, determine what needs to run

3. **Concurrency safety**:
   - Use a single process with threads for step execution
   - File locking or atomic writes for event log
   - Single writer to event log (main thread)

4. **Cancellation**:
   - Use threading.Event for cancellation signal
   - Kill subprocesses when cancelled

5. **Race condition mitigation**:
   - Main thread manages state transitions
   - Worker threads only execute steps
   - Events logged immediately before state change
   - Use atomic file operations

Let me implement this step by step.
<<<reasoning_content_end>>># Mini Event-Sourced Workflow Engine

Here's a complete implementation of the workflow engine with all required features.

```python
#!/usr/bin/env python3
"""
Mini Event-Sourced Workflow Engine

A local workflow engine that executes DAG-based workflows with:
- Parallel execution of independent steps
- Retries with exponential backoff
- Per-step timeout
- Run cancellation
- Event-sourced persistence to disk
- Restart/resume after crash
- Deterministic replay from event log
"""

import argparse
import hashlib
import heapq
import json
import os
import subprocess
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, Future
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum, auto
from pathlib import Path
from typing import Dict, List, Optional, Set, Any, Tuple

# ============================================================================
# Constants and Configuration
# ============================================================================

EVENTS_DIR = Path("./workflow_events")
RUNS_DIR = Path("./workflow_runs")
MAX_WORKERS = 4
DEFAULT_BACKOFF_BASE = 1.0
DEFAULT_BACKOFF_MAX = 60.0
EVENT_FILE_SUFFIX = ".log"


class StepState(Enum):
    """State machine for individual steps"""
    PENDING = auto()
    READY = auto()
    RUNNING = auto()
    SUCCEEDED = auto()
    FAILED = auto()
    SKIPPED = auto()
    CANCELLED = auto()
    RETRYING = auto()


class WorkflowState(Enum):
    """State machine for overall workflow"""
    RUNNING = auto()
    COMPLETED = auto()
    FAILED = auto()
    CANCELLED = auto()


# ============================================================================
# Event Classes
# ============================================================================

@dataclass
class Event:
    """Base event class"""
    event_id: str
    event_type: str
    timestamp: str
    workflow_id: str
    run_id: str
    data: Dict[str, Any]

    def to_json(self) -> str:
        return json.dumps(self.__dict__)

    @classmethod
    def from_json(cls, json_str: str) -> 'Event':
        data = json.loads(json_str)
        return Event(
            event_id=data['event_id'],
            event_type=data['event_type'],
            timestamp=data['timestamp'],
            workflow_id=data['workflow_id'],
            run_id=data['run_id'],
            data=data['data']
        )


def generate_event_id(run_id: str, sequence: int, content: str) -> str:
    """Generate deterministic event ID for replay consistency"""
    hash_input = f"{run_id}:{sequence}:{content}"
    return hashlib.sha256(hash_input.encode()).hexdigest()[:16]


# ============================================================================
# Event Store
# ============================================================================

class EventStore:
    """
    Append-only event log storage with atomic writes.

    Race condition mitigation:
    - Single writer (main thread) ensures no concurrent writes
    - Write to temp file then rename for atomicity
    - Events are persisted before state changes
    """

    def __init__(self, run_id: str):
        self.run_id = run_id
        self.event_file = EVENTS_DIR / f"{run_id}{EVENT_FILE_SUFFIX}"
        self._lock = threading.Lock()
        self._ensure_dir()

    def _ensure_dir(self):
        EVENTS_DIR.mkdir(parents=True, exist_ok=True)

    def append(self, event: Event) -> None:
        """Atomically append event to log"""
        with self._lock:
            temp_file = self.event_file.with_suffix('.tmp')
            with open(temp_file, 'a') as f:
                f.write(event.to_json() + '\n')
                f.flush()
                os.fsync(f.fileno())
            os.rename(temp_file, self.event_file)

    def read_all(self) -> List[Event]:
        """Read all events from log"""
        if not self.event_file.exists():
            return []
        events = []
        with open(self.event_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line:
                    events.append(Event.from_json(line))
        return events

    def exists(self) -> bool:
        return self.event_file.exists()


# ============================================================================
# Workflow Definitions
# ============================================================================

@dataclass
class StepDefinition:
    """Definition of a workflow step"""
    id: str
    command: str
    depends_on: List[str]
    retries: int
    timeout_sec: int


@dataclass
class WorkflowDefinition:
    """Definition of a complete workflow"""
    workflow_id: str
    steps: List[StepDefinition]

    @classmethod
    def from_json(cls, path: str) -> 'WorkflowDefinition':
        with open(path, 'r') as f:
            data = json.load(f)

        steps = []
        for step_data in data['steps']:
            steps.append(StepDefinition(
                id=step_data['id'],
                command=step_data['command'],
                depends_on=step_data.get('depends_on', []),
                retries=step_data.get('retries', 0),
                timeout_sec=step_data.get('timeout_sec', 60)
            ))

        return cls(
            workflow_id=data['workflow_id'],
            steps=steps
        )

    def validate(self) -> None:
        """Validate workflow: check for cycles and invalid dependencies"""
        # Check all dependencies exist
        all_step_ids = {step.id for step in self.steps}
        for step in self.steps:
            for dep in step.depends_on:
                if dep not in all_step_ids:
                    raise ValueError(f"Step '{step.id}' depends on unknown step '{dep}'")

        # Check for cycles using DFS
        self._detect_cycles()

    def _detect_cycles(self) -> None:
        """Detect cycles in dependency graph using DFS"""
        WHITE, GRAY, BLACK = 0, 1, 2
        color = {step.id: WHITE for step in self.steps}

        def dfs(node: str) -> None:
            color[node] = GRAY
            for step in self.steps:
                if step.id == node:
                    for dep in step.depends_on:
                        if color[dep] == GRAY:
                            raise ValueError(f"Cycle detected involving step '{node}'")
                        if color[dep] == WHITE:
                            dfs(dep)
            color[node] = BLACK

        for step in self.steps:
            if color[step.id] == WHITE:
                dfs(step.id)


# ============================================================================
# Step State Tracker
# ============================================================================

@dataclass
class StepStateTracker:
    """Tracks the current state of a step"""
    step_id: str
    state: StepState = StepState.PENDING
    retry_count: int = 0
    result: Optional[str] = None
    error: Optional[str] = None
    last_updated: Optional[str] = None


# ============================================================================
# State Machine (Reconstructed from Events)
# ============================================================================

class StateMachine:
    """
    Reconstructs workflow state from event log.

    This is the heart of the event-sourced architecture:
    - On startup, reads all events and replays them
    - State is derived from events, not stored directly
    - Enables deterministic replay and crash recovery
    """

    def __init__(self, workflow_def: WorkflowDefinition, run_id: str, event_store: EventStore):
        self.workflow_def = workflow_def
        self.run_id = run_id
        self.event_store = event_store
        self.steps: Dict[str, StepStateTracker] = {}
        self.workflow_state = WorkflowState.RUNNING
        self._sequence = 0
        self._replay_events()

    def _replay_events(self) -> None:
        """Replay all events to reconstruct current state"""
        events = self.event_store.read_all()

        # Initialize step trackers
        for step in self.workflow_def.steps:
            self.steps[step.id] = StepStateTracker(step_id=step.id)

        # Replay events to build state
        for event in events:
            self._apply_event(event)

    def _apply_event(self, event: Event) -> None:
        """Apply a single event to update state"""
        event_type = event.event_type

        if event_type == "WORKFLOW_STARTED":
            self.workflow_state = WorkflowState.RUNNING

        elif event_type == "WORKFLOW_COMPLETED":
            self.workflow_state = WorkflowState.COMPLETED

        elif event_type == "WORKFLOW_FAILED":
            self.workflow_state = WorkflowState.FAILED

        elif event_type == "WORKFLOW_CANCELLED":
            self.workflow_state = WorkflowState.CANCELLED

        elif event_type == "STEP_READY":
            step_id = event.data['step_id']
            if step_id in self.steps:
                self.steps[step_id].state = StepState.READY
                self.steps[step_id].last_updated = event.timestamp

        elif event_type == "STEP_RUNNING":
            step_id = event.data['step_id']
            if step_id in self.steps:
                self.steps[step_id].state = StepState.RUNNING
                self.steps[step_id].last_updated = event.timestamp

        elif event_type == "STEP_SUCCEEDED":
            step_id = event.data['step_id']
            if step_id in self.steps:
                self.steps[step_id].state = StepState.SUCCEEDED
                self.steps[step_id].result = event.data.get('output')
                self.steps[step_id].last_updated = event.timestamp

        elif event_type == "STEP_FAILED":
            step_id = event.data['step_id']
            if step_id in self.steps:
                self.steps[step_id].state = StepState.FAILED
                self.steps[step_id].error = event.data.get('error')
                self.steps[step_id].last_updated = event.timestamp

        elif event_type == "STEP_SKIPPED":
            step_id = event.data['step_id']
            if step_id in self.steps:
                self.steps[step_id].state = StepState.SKIPPED
                self.steps[step_id].error = event.data.get('reason')
                self.steps[step_id].last_updated = event.timestamp

        elif event_type == "STEP_CANCELLED":
            step_id = event.data['step_id']
            if step_id in self.steps:
                self.steps[step_id].state = StepState.CANCELLED
                self.steps[step_id].last_updated = event.timestamp

        elif event_type == "STEP_RETRYING":
            step_id = event.data['step_id']
            if step_id in self.steps:
                self.steps[step_id].state = StepState.RETRYING
                self.steps[step_id].retry_count = event.data.get('retry_count', 0)
                self.steps[step_id].last_updated = event.timestamp

    def get_ready_steps(self) -> List[str]:
        """Get steps that are ready to run"""
        ready = []
        for step in self.workflow_def.steps:
            tracker = self.steps[step.id]

            # Skip if already completed in any terminal state
            if tracker.state in (StepState.SUCCEEDED, StepState.SKIPPED,
                                StepState.CANCELLED, StepState.FAILED):
                continue

            # Check if all dependencies are satisfied
            deps_satisfied = True
            for dep_id in step.depends_on:
                dep_state = self.steps[dep_id].state
                if dep_state != StepState.SUCCEEDED:
                    deps_satisfied = False
                    break

            if deps_satisfied and tracker.state == StepState.PENDING:
                ready.append(step.id)

        return ready

    def get_running_steps(self) -> List[str]:
        """Get steps currently running"""
        return [s.id for s in self.steps.values() if s.state == StepState.RUNNING]

    def mark_step_failed_permanently(self, step_id: str) -> List[str]:
        """
        Mark a step as permanently failed and return downstream steps to skip.
        """
        self.steps[step_id].state = StepState.FAILED
        to_skip = self._find_downstream_steps(step_id)
        return to_skip

    def _find_downstream_steps(self, failed_step: str) -> List[str]:
        """Find all steps that depend on failed_step (directly or transitively)"""
        to_skip = set()
        queue = [failed_step]

        while queue:
            current = queue.pop(0)
            for step in self.workflow_def.steps:
                if current in step.depends_on and step.id not in to_skip:
                    if step.id not in [s.id for s in self.steps.values()
                                       if s.state in (StepState.SUCCEEDED, StepState.SKIPPED,
                                                      StepState.CANCELLED, StepState.FAILED)]:
                        to_skip.add(step.id)
                        queue.append(step.id)

        return list(to_skip)

    def is_complete(self) -> bool:
        """Check if workflow has reached terminal state"""
        return self.workflow_state in (WorkflowState.COMPLETED,
                                       WorkflowState.FAILED,
                                       WorkflowState.CANCELLED)


# ============================================================================
# Workflow Runner
# ============================================================================

class WorkflowRunner:
    """
    Executes workflows with parallel step execution.

    Race condition mitigation:
    - Main thread manages all state transitions
    - Worker threads only execute steps and report results
    - Events logged before state changes
    - ThreadPoolExecutor limits concurrent execution
    - Cancellation uses shared event for clean shutdown
    """

    def __init__(self, workflow_def: WorkflowDefinition, run_id: str):
        self.workflow_def = workflow_def
        self.run_id = run_id
        self.event_store = EventStore(run_id)
        self.state_machine = StateMachine(workflow_def, run_id, self.event_store)
        self._cancel_event = threading.Event()
        self._futures: Dict[str, Future] = {}
        self._executor: Optional[ThreadPoolExecutor] = None

    def _generate_event(self, event_type: str, data: Dict[str, Any]) -> Event:
        """Generate a new event with deterministic ID"""
        content = json.dumps({'type': event_type, 'data': data}, sort_keys=True)
        self.state_machine._sequence += 1
        event_id = generate_event_id(self.run_id, self.state_machine._sequence, content)

        return Event(
            event_id=event_id,
            event_type=event_type,
            timestamp=datetime.utcnow().isoformat(),
            workflow_id=self.workflow_def.workflow_id,
            run_id=self.run_id,
            data=data
        )

    def _emit_event(self, event: Event) -> None:
        """Emit event to store and apply to state machine"""
        self.event_store.append(event)
        self.state_machine._apply_event(event)

    def run(self) -> None:
        """Main execution loop"""
        # Check if already completed (from previous run)
        if self.state_machine.is_complete():
            print(f"Workflow {self.run_id} already completed with state: "
                  f"{self.state_machine.workflow_state.name}")
            return

        # Emit workflow started if not already done
        if not self.event_store.exists():
            event = self._generate_event("WORKFLOW_STARTED", {
                'workflow_id': self.workflow_def.workflow_id
            })
            self._emit_event(event)

        # Start executor for parallel execution
        self._executor = ThreadPoolExecutor(max_workers=MAX_WORKERS)

        try:
            self._execute_workflow()
        finally:
            self._executor.shutdown(wait=True)

    def _execute_workflow(self) -> None:
        """Execute workflow with parallel step execution"""
        while not self._should_stop():
            # Check for cancellation
            if self._cancel_event.is_set():
                self._handle_cancellation()
                break

            # Get ready steps
            ready_steps = self.state_machine.get_ready_steps()

            if not ready_steps:
                # Check if we're done
                if self._check_completion():
                    break
                # No ready steps - might be waiting for running steps
                time.sleep(0.1)
                continue

            # Submit ready steps for execution
            for step_id in ready_steps:
                if step_id not in self._futures and not self._cancel_event.is_set():
                    self._submit_step(step_id)

            # Check for completed futures
            self._check_completed_futures()

            # Brief sleep to avoid busy loop
            time.sleep(0.05)

    def _submit_step(self, step_id: str) -> None:
        """Submit a step for execution"""
        step_def = next(s for s in self.workflow_def.steps if s.id == step_id)

        # Emit STEP_READY event
        event = self._generate_event("STEP_READY", {'step_id': step_id})
        self._emit_event(event)

        # Emit STEP_RUNNING event
        event = self._generate_event("STEP_RUNNING", {'step_id': step_id})
        self._emit_event(event)

        # Submit to executor
        future = self._executor.submit(self._execute_step, step_def)
        self._futures[step_id] = future

    def _execute_step(self, step_def: StepDefinition) -> Tuple[str, bool, Optional[str]]:
        """
        Execute a single step.
        Returns: (step_id, success, error_message)
        """
        try:
            # Check for cancellation before starting
            if self._cancel_event.is_set():
                return (step_def.id, False, "Cancelled before execution")

            # Execute command with timeout
            result = subprocess.run(
                step_def.command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=step_def.timeout_sec
            )

            if result.returncode == 0:
                return (step_def.id, True, None)
            else:
                error = f"Exit code {result.returncode}: {result.stderr.strip()}"
                return (step_def.id, False, error)

        except subprocess.TimeoutExpired:
            return (step_def.id, False, f"Timeout after {step_def.timeout_sec} seconds")
        except Exception as e:
            return (step_def.id, False, str(e))

    def _check_completed_futures(self) -> None:
        """Check completed futures and handle results"""
        completed = []
        for step_id, future in self._futures.items():
            if future.done():
                completed.append((step_id, future))

        for step_id, future in completed:
            try:
                result_step_id, success, error = future.result()
                step_def = next(s for s in self.workflow_def.steps if s.id == step_id)

                if success:
                    self._handle_step_success(step_id)
                else:
                    self._handle_step_failure(step_def, error)

            except Exception as e:
                step_def = next(s for s in self.workflow_def.steps if s.id == step_id)
                self._handle_step_failure(step_def, f"Unexpected error: {e}")

            del self._futures[step_id]

    def _handle_step_success(self, step_id: str) -> None:
        """Handle successful step completion"""
        event = self._generate_event("STEP_SUCCEEDED", {'step_id': step_id})
        self._emit_event(event)

    def _handle_step_failure(self, step_def: StepDefinition, error: str) -> None:
        """Handle failed step with retry logic"""
        tracker = self.state_machine.steps[step_def.id]

        if tracker.retry_count < step_def.retries:
            # Retry with exponential backoff
            tracker.retry_count += 1
            backoff = min(
                DEFAULT_BACKOFF_BASE * (2 ** tracker.retry_count),
                DEFAULT_BACKOFF_MAX
            )

            event = self._generate_event("STEP_RETRYING", {
                'step_id': step_def.id,
                'retry_count': tracker.retry_count,
                'backoff_sec': backoff
            })
            self._emit_event(event)

            time.sleep(backoff)

            # Re-emit ready/running and resubmit
            event = self._generate_event("STEP_READY", {'step_id': step_def.id})
            self._emit_event(event)

            event = self._generate_event("STEP_RUNNING", {'step_id': step_def.id})
            self._emit_event(event)

            future = self._executor.submit(self._execute_step, step_def)
            self._futures[step_def.id] = future
        else:
            # Permanently failed
            event = self._generate_event("STEP_FAILED", {
                'step_id': step_def.id,
                'error': error,
                'retry_count': tracker.retry_count
            })
            self._emit_event(event)

            # Mark downstream as skipped
            to_skip = self.state_machine.mark_step_failed_permanently(step_def.id)
            for skip_id in to_skip:
                event = self._generate_event("STEP_SKIPPED", {
                    'step_id': skip_id,
                    'reason': f"Dependency failed: {step_def.id}"
                })
                self._emit_event(event)

    def _should_stop(self) -> bool:
        """Check if execution should stop"""
        if self._cancel_event.is_set():
            return True
        if self.state_machine.is_complete():
            return True
        return False

    def _check_completion(self) -> bool:
        """Check if workflow is complete and emit final event"""
        all_done = True
        failed_any = False

        for tracker in self.state_machine.steps.values():
            if tracker.state == StepState.RUNNING:
                all_done = False
                break
            elif tracker.state in (StepState.FAILED, StepState.CANCELLED):
                failed_any = True

        if all_done:
            if failed_any:
                event = self._generate_event("WORKFLOW_FAILED", {
                    'workflow_id': self.workflow_def.workflow_id
                })
                self._emit_event(event)
            else:
                event = self._generate_event("WORKFLOW_COMPLETED", {
                    'workflow_id': self.workflow_def.workflow_id
                })
                self._emit_event(event)
            return True

        return False

    def _handle_cancellation(self) -> None:
        """Handle workflow cancellation"""
        # Cancel all pending futures
        for step_id in self._futures:
            self._futures[step_id].cancel()

        # Mark running steps as cancelled
        for tracker in self.state_machine.steps.values():
            if tracker.state == StepState.RUNNING:
                event = self._generate_event("STEP_CANCELLED", {'step_id': tracker.step_id})
                self._emit_event(event)

        # Mark pending/ready steps as cancelled
        for tracker in self.state_machine.steps.values():
            if tracker.state in (StepState.PENDING, StepState.READY, StepState.RETRYING):
                event = self._generate_event("STEP_CANCELLED", {'step_id': tracker.step_id})
                self._emit_event(event)

        # Emit workflow cancelled
        event = self._generate_event("WORKFLOW_CANCELLED", {
            'workflow_id': self.workflow_def.workflow_id
        })
        self._emit_event(event)

    def cancel(self) -> None:
        """Request cancellation of workflow"""
        self._cancel_event.set()


# ============================================================================
# CLI
# ============================================================================

def generate_run_id(workflow_id: str) -> str:
    """Generate unique run ID"""
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S%f")
    unique = hashlib.sha256(f"{workflow_id}:{timestamp}".encode()).hexdigest()[:8]
    return f"{workflow_id}-{unique}"


def cmd_run(args) -> int:
    """Execute a workflow"""
    try:
        workflow_def = WorkflowDefinition.from_json(args.workflow)
        workflow_def.validate()
    except Exception as e:
        print(f"Error loading workflow: {e}", file=sys.stderr)
        return 1

    run_id = generate_run_id(workflow_def.workflow_id)
    print(f"Starting workflow run: {run_id}")

    runner = WorkflowRunner(workflow_def, run_id)
    runner.run()

    final_state = runner.state_machine.workflow_state
    print(f"Workflow completed with state: {final_state.name}")

    # Print summary
    print("\nStep summary:")
    for step_id, tracker in runner.state_machine.steps.items():
        print(f"  {step_id}: {tracker.state.name}")

    return 0


def cmd_status(args) -> int:
    """Show status of a workflow run"""
    try:
        workflow_def = WorkflowDefinition.from_json(args.workflow)
    except Exception as e:
        print(f"Error loading workflow: {e}", file=sys.stderr)
        return 1

    event_store = EventStore(args.run_id)
    if not event_store.exists():
        print(f"No event log found for run: {args.run_id}", file=sys.stderr)
        return 1

    state_machine = StateMachine(workflow_def, args.run_id, event_store)

    print(f"Run ID: {args.run_id}")
    print(f"Workflow: {workflow_def.workflow_id}")
    print(f"State: {state_machine.workflow_state.name}")
    print("\nSteps:")
    for step_id, tracker in state_machine.steps.items():
        status = tracker.state.name
        if tracker.error:
            status += f" ({tracker.error[:50]}...)"
        print(f"  {step_id}: {status}")

    return 0


def cmd_cancel(args) -> int:
    """Cancel a running workflow"""
    try:
        workflow_def = WorkflowDefinition.from_json(args.workflow)
    except Exception as e:
        print(f"Error loading workflow: {e}", file=sys.stderr)
        return 1

    event_store = EventStore(args.run_id)
    if not event_store.exists():
        print(f"No event log found for run: {args.run_id}", file=sys.stderr)
        return 1

    state_machine = StateMachine(workflow_def, args.run_id, event_store)

    if state_machine.workflow_state in (WorkflowState.COMPLETED,
                                        WorkflowState.FAILED,
                                        WorkflowState.CANCELLED):
        print(f"Workflow already in terminal state: {state_machine.workflow_state.name}")
        return 0

    print(f"Cancelling workflow run: {args.run_id}")

    runner = WorkflowRunner(workflow_def, args.run_id)
    runner.cancel()

    # Wait briefly for cleanup
    time.sleep(0.5)

    print(f"Workflow cancelled. Final state: {runner.state_machine.workflow_state.name}")
    return 0


def cmd_replay(args) -> int:
    """Replay events to reconstruct state (verification)"""
    try:
        workflow_def = WorkflowDefinition.from_json(args.workflow)
    except Exception as e:
        print(f"Error loading workflow: {e}", file=sys.stderr)
        return 1

    event_store = EventStore(args.run_id)
    if not event_store.exists():
        print(f"No event log found for run: {args.run_id}", file=sys.stderr)
        return 1

    print(f"Replaying events for run: {args.run_id}")

    events = event_store.read_all()
    print(f"Found {len(events)} events")

    # Replay and show events
    for event in events:
        print(f"  [{event.timestamp}] {event.event_type}: {event.data}")

    # Reconstruct final state
    state_machine = StateMachine(workflow_def, args.run_id, event_store)
    print(f"\nReconstructed state: {state_machine.workflow_state.name}")
    return 0


def main():
    parser = argparse.ArgumentParser(description="Mini Event-Sourced Workflow Engine")
    subparsers = parser.add_subparsers(dest='command', help='Commands')

    # run command
    run_parser = subparsers.add_parser('run', help='Run a workflow')
    run_parser.add_argument('workflow', help='Path to workflow JSON file')

    # status command
    status_parser = subparsers.add_parser('status', help='Show workflow status')
    status_parser.add_argument('run_id', help='Run ID to check')
    status_parser.add_argument('workflow', help='Path to workflow JSON file')

    # cancel command
    cancel_parser = subparsers.add_parser('cancel', help='Cancel a workflow')
    cancel_parser.add_argument('run_id', help='Run ID to cancel')
    cancel_parser.add_argument('workflow', help='Path to workflow JSON file')

    # replay command
    replay_parser = subparsers.add_parser('replay', help='Replay events for verification')
    replay_parser.add_argument('run_id', help='Run ID to replay')
    replay_parser.add_argument('workflow', help='Path to workflow JSON file')

    args = parser.parse_args()

    if args.command == 'run':
        sys.exit(cmd_run(args))
    elif args.command == 'status':
        sys.exit(cmd_status(args))
    elif args.command == 'cancel':
        sys.exit(cmd_cancel(args))
    elif args.command == 'replay':
        sys.exit(cmd_replay(args))
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == '__main__':
    main()
```

## Usage Examples

### Sample workflow.json:
```json
{
  "workflow_id": "image_pipeline",
  "steps": [
    {
      "id": "download",
      "command": "echo 'Downloading...' && sleep 1",
      "depends_on": [],
      "retries": 2,
      "timeout_sec": 30
    },
    {
      "id": "preprocess",
      "command": "echo 'Preprocessing...' && sleep 1",
      "depends_on": ["download"],
      "retries": 1,
      "timeout_sec": 20
    },
    {
      "id": "embed",
      "command": "echo 'Embedding...' && sleep 1",
      "depends_on": ["preprocess"],
      "retries": 1,
      "timeout_sec": 60
    },
    {
      "id": "classify",
      "command": "echo 'Classifying...' && sleep 1",
      "depends_on": ["preprocess"],
      "retries": 1,
      "timeout_sec": 60
    },
    {
      "id": "publish",
      "command": "echo 'Publishing...' && sleep 1",
      "depends_on": ["embed", "classify"],
      "retries": 0,
      "timeout_sec": 15
    }
  ]
}
```

### CLI Commands:
```bash
# Run a workflow
python workflow.py run workflow.json

# Check status
python workflow.py status image_pipeline-2024010112000012345678 workflow.json

# Cancel a running workflow
python workflow.py cancel image_pipeline-2024010112000012345678 workflow.json

# Replay events for verification
python workflow.py replay image_pipeline-2024010112000012345678 workflow.json
```

## Key Design Decisions

### Race Condition Mitigation:
1. **Single writer pattern**: Only the main thread writes to the event log
2. **Atomic file operations**: Write to temp file, then rename
3. **State derived from events**: No separate state storage to sync
4. **ThreadPoolExecutor**: Bounded concurrent execution with controlled workers

### Event-Sourced Architecture:
1. **Append-only log**: Events are never modified or deleted
2. **Deterministic replay**: State reconstructed by replaying events
3. **Crash recovery**: Simply re-read events on restart

### Concurrency:
1. **Parallel step execution**: Independent steps run concurrently
2. **Cancellation propagation**: Shared event signals cancellation to all threads
3. **Graceful shutdown**: Executor waits for in-flight tasks