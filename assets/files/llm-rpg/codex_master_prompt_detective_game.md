# Master Prompt for Codex: Build a Local-LLM Detective CLI Prototype

You are GPT-5.4 running in Codex. Build a weekend-scope Python CLI prototype of a text-only detective/puzzle game.

Your job is to implement the project from scratch in a clean, minimal repository using sequential agent-style work: build, review, validate, refine. Do not overbuild. Optimize for architectural cleanliness, coherence, and narrative consistency.

## Product goal

Build a single-player text game set in one small fixed location. The player is trapped in that location and must solve a simple mystery/puzzle to exit. The player progresses by:

- talking to one main NPC who knows something important,
- inspecting and interacting with a few environment objects,
- inferring the right action to unlock the exit.

The story should be handcrafted and small. LLMs should add controlled improvisation, not drive the truth of the world.

## Hard constraints

- Python only.
- CLI only.
- Local inference only.
- Use `llama.cpp` for all model inference.
- Use custom orchestration only. No LangChain, LangGraph, AutoGen, CrewAI, or similar frameworks.
- Agents run sequentially, not concurrently.
- Log each game turn into a JSONL file, including raw model outputs and engine state transitions.
- Do not include commercial APIs or commercial model abstractions.
- Keep the repo small and understandable.

## Required local models

Use these exact runtime roles unless impossible:

1. **Router model**

   - Model family: `Qwen3-4B`
   - Quantization: quantized GGUF suitable for llama.cpp
   - Purpose: classify player input into one of the high-level intents and produce structured action requests.
   - This model must be used with grammar/schema-constrained structured output.

2. **NPC dialogue model**

   - Model family: `QwQ-32B`
   - Quantization: Q4 GGUF
   - Purpose: generate the NPC’s in-character reply, bounded by world state and secret constraints.
   - This model must not invent new facts that change the puzzle solution.

3. **Narrator/composer model**

   - Model family: `QwQ-32B`
   - Quantization: Q4 GGUF
   - Purpose: generate environmental descriptions, action results, flavor text, and short clarifications.
   - This model must be constrained by engine truth.

If needed, you may implement a deterministic fallback for any runtime component, but the default path must use the models above.

## Core design principle

The engine is the source of truth. Models do not own state.

The game must be built as a deterministic symbolic world model with LLM-assisted language behavior layered on top.

That means:

- puzzle facts,
- item locations,
- lock conditions,
- NPC knowledge,
- solved/unsolved conditions,
- inventory,
- room/object states,
- allowed actions,
- ending conditions

must live in Python data structures and state transition functions.

LLMs can:

- classify intent,
- map phrasing to supported actions,
- produce dialogue,
- produce narrative text,
- paraphrase,
- add small flavor details that do not alter truth.

LLMs cannot:

- create new objects,
- reveal information the NPC should not know,
- move items unless the engine says so,
- modify puzzle truth,
- decide win/loss conditions.

## Minimum viable game

Build v1 with exactly one location composed of a few inspectable sub-areas. Keep it small.

Suggested world:

- Setting: a locked office, study, security room, or similar contained location.
- Exit: a locked door requiring a code, key, or sequence.
- Main NPC: one character present in the room who knows a clue but will not reveal it immediately.
- Environment: 4 to 6 interactive objects.
- Inventory: at most 3 items.
- Puzzle chain: very short, but requiring both dialogue and environment interaction.

Example structure:

- Player needs a code to unlock a cabinet.
- Cabinet contains an item or note needed to open the exit.
- NPC knows the code or a clue to derive it.
- NPC only reveals it after the player asks the right kind of question or proves something by interacting with the environment.

You may choose a better tiny mystery if it fits the same complexity.

## Required architecture

Implement the code with these modules or a very close equivalent:

- `main.py`

  - CLI loop entrypoint.

- `game/state.py`

  - Dataclasses or typed models for game state.

- `game/world.py`

  - Static handcrafted world definition.

- `game/actions.py`

  - Deterministic action application and state transitions.

- `game/parser.py`

  - Turn orchestration. Calls router and dispatches to engine.

- `game/narration.py`

  - Narrator/composer model wrapper and prompts.

- `game/npc.py`

  - NPC dialogue model wrapper and prompts.

- `game/router.py`

  - Router model wrapper and structured output enforcement.

- `game/schemas.py`

  - JSON Schemas or typed equivalents for constrained outputs.

- `game/logging.py`

  - JSONL turn logger.

- `tests/`

  - A small but meaningful test suite.

- `README.md`

  - Setup and run instructions.

- `docs/design.md`

  - Brief architecture and world design notes.

## Sequential agent workflow inside Codex

Use this work loop internally and explicitly.

### Agent 1: Builder

Responsibilities:

- create the repo structure,
- implement the world model,
- implement inference wrappers,
- implement the CLI loop,
- implement logging,
- implement tests.

### Agent 2: Reviewer

Responsibilities:

- review architecture,
- find state-consistency bugs,
- identify prompt leakage risks,
- check whether models can violate puzzle truth,
- simplify where needed.

### Agent 3: Validator

Responsibilities:

- run tests,
- run sample transcripts,
- verify JSONL logs,
- verify constrained outputs are actually parseable,
- verify no invalid state transitions occur.

### Agent 4: Refiner

Only if needed. Responsibilities:

- tighten prompts,
- fix edge cases,
- improve narrative consistency,
- reduce code duplication,
- improve failure handling.

Do not simulate a large bureaucracy. Sequential passes only. Produce actual code changes, not long reports.

## Turn loop requirements

Each turn must follow this shape:

1. Read player input.
2. Send player input plus minimal context to the router model.
3. Router returns structured intent.
4. Deterministic engine validates and applies the requested action.
5. If the action is an NPC interaction, call NPC model with bounded context.
6. If the action is environment interaction, call narrator/composer if needed.
7. Render response to player.
8. Append a JSONL record for the turn.

## Supported player intent categories

Keep the router output small. At minimum support:

- `talk`
- `inspect`
- `use`
- `take`
- `move`
- `inventory`
- `ask_state`
- `help`
- `unknown`

You may merge or rename categories if the system stays clean, but keep the action vocabulary tight.

## llama.cpp integration requirements

Use llama.cpp in a way that is reproducible and structured.

Prefer one of these approaches:

1. `llama-server` with its OpenAI-compatible API and JSON schema response formatting.
2. A direct llama.cpp Python/server wrapper only if it still supports grammar/schema-constrained outputs cleanly.

Default recommendation: use `llama-server` locally and call it from Python.

### Structured output requirement for router

The router must produce valid machine-readable JSON only.

Use llama.cpp’s structured output capability, not prompt-only “please respond in JSON”.

Implement one of these two mechanisms, preferring schema if available:

- JSON Schema constrained generation, or
- GBNF grammar constrained generation.

The repository should expose both abstractions if practical:

- a JSON Schema version for clarity,
- an optional GBNF grammar fallback for robustness.

### Router output schema

Implement a schema approximately like this:

```json
{
  "type": "object",
  "properties": {
    "intent": {
      "type": "string",
      "enum": ["talk", "inspect", "use", "take", "move", "inventory", "ask_state", "help", "unknown"]
    },
    "target": {
      "type": ["string", "null"]
    },
    "secondary_target": {
      "type": ["string", "null"]
    },
    "utterance": {
      "type": ["string", "null"]
    },
    "confidence": {
      "type": "number"
    }
  },
  "required": ["intent", "target", "secondary_target", "utterance", "confidence"],
  "additionalProperties": false
}
```

Meaning:

- `intent`: selected action class.
- `target`: object or character name if present.
- `secondary_target`: optional second argument for actions like `use key on door`.
- `utterance`: normalized message for NPC talk actions.
- `confidence`: model confidence estimate for debugging only.

The engine must never trust this blindly. It must validate names against known objects and known commands.

### Grammar/schema handling requirements

In the code and docs, specify clearly:

- where the schema lives,
- how it is passed into llama.cpp,
- what happens if the model output cannot be parsed,
- what deterministic fallback is used.

Required fallback behavior:

- If router structured generation fails or parses into an invalid object, classify as `unknown` and ask the player to rephrase.
- Log the parse failure and raw output.

### NPC and narrator output handling

NPC and narrator do not need full JSON schemas unless helpful, but their outputs must still be bounded.

Use one of these patterns:

- plain text with tight prompt rules and a post-check,
- or small structured output such as `{ "text": "..." }` if that improves reliability.

However, avoid overcomplicating these two unless there is a real benefit.

## Prompting rules

### Router prompt

The router prompt must be short and mechanical. It should:

- list supported intents,
- list canonical object/character names,
- instruct the model to normalize the player request into the schema,
- avoid narrative language.

### NPC prompt

The NPC prompt must include:

- the NPC identity and tone,
- what the NPC knows,
- what the NPC must not reveal yet,
- reveal conditions based on engine state,
- a short summary of recent conversation,
- a hard rule that the NPC cannot invent world facts.

The NPC should be allowed mild improvisation in wording, evasiveness, emotion, and hints.

### Narrator/composer prompt

The narrator prompt must include:

- current room state,
- object state,
- result of deterministic action,
- style guidance for concise atmospheric text,
- a hard rule not to add new interactive affordances unless explicitly present in engine state.

## Required state model

At minimum, state should include:

- current location,
- discovered clues,
- inventory,
- object states,
- conversation flags,
- puzzle progress flags,
- turn count,
- game over / escaped flag,
- a small recent transcript buffer for prompting.

Prefer typed dataclasses or Pydantic models if they do not add unnecessary weight.

## Required logging

Every turn must be appended to a JSONL file.

Each JSON object must include at least:

- `turn_index`
- `timestamp`
- `player_input`
- `router_prompt_excerpt` or reference
- `router_raw_output`
- `router_parsed_output`
- `validated_action`
- `state_before`
- `state_transition`
- `state_after`
- `npc_prompt_excerpt` when applicable
- `npc_raw_output` when applicable
- `narrator_prompt_excerpt` when applicable
- `narrator_raw_output` when applicable
- `rendered_response`
- `error` if any

Requirements:

- Store one JSON object per line.
- Ensure serialization is stable and readable.
- Log enough state to debug coherence issues.
- Avoid storing huge full prompts if not needed; excerpts or compact prompt payloads are acceptable.

## Deterministic validation rules

The engine must validate all model-suggested actions before state changes.

Examples:

- If the router says `take lamp` but there is no lamp, reject safely.
- If the NPC says something that would reveal a locked clue before reveal conditions are met, suppress or regenerate.
- If the narrator mentions an object not in the room state, reject or replace with deterministic text.

Prefer a conservative strategy:

- preserve correctness,
- degrade flavor if needed,
- never let narrative creativity break puzzle logic.

## Failure handling

Implement graceful handling for:

- router parse failure,
- invalid action target,
- unavailable model server,
- timeout,
- malformed JSON,
- empty model output.

Behavior should be simple:

- print a short user-facing message,
- log the event,
- avoid corrupting state.

## Testing requirements

Write a compact test suite that covers at least:

- state initialization,
- a successful puzzle path,
- invalid actions do not corrupt state,
- router output validation,
- JSONL log writing,
- win condition,
- reveal gating for the NPC.

Also include at least 2 scripted transcript tests or transcript-like scenarios.

## CLI requirements

CLI should support:

- normal play,
- `inventory`,
- `help`,
- `quit`,
- optional `look` or equivalent state summary.

Output should be readable and compact.

## Documentation requirements

Provide:

### `README.md`

Include:

- setup,
- model placement assumptions,
- how to run llama.cpp / llama-server,
- how to configure model paths or endpoints,
- how to run the game,
- how to run tests,
- where logs are stored.

### `docs/design.md`

Include:

- architecture,
- why state is deterministic,
- model role split,
- schema-constrained router explanation,
- logging design,
- known limitations.

## Explicit implementation guidance for llama.cpp structured outputs

Do not leave this vague. Implement a real path.

In docs and code, explain that llama.cpp can be constrained using a JSON schema or grammar so that the router emits only valid structured objects.

Your implementation should include:

- a Python helper that sends the router request with a schema/grammar,
- a parser/validator layer after model output,
- a fallback if the constrained output still fails validation.

If using `llama-server`, encapsulate the request payload in a single helper function so the rest of the code does not care whether schema or grammar is used underneath.

Provide a small example in the docs showing a router request and a returned JSON object.

## Development strategy

Build in this order:

1. deterministic engine with no LLMs,
2. handcrafted tiny story and puzzle,
3. router structured output integration,
4. narrator integration,
5. NPC integration,
6. logging,
7. tests and transcript checks,
8. final cleanup.

Do not start from prompt engineering. Start from world state and state transitions.

## Non-goals

Do not add:

- multiple rooms unless extremely small and clearly beneficial,
- multiple NPCs,
- combat,
- procedural world generation,
- vector DBs,
- embeddings,
- memory systems beyond recent transcript buffer,
- complex UI,
- save/load unless trivial.

## Quality bar

The prototype is successful if:

- the puzzle can be completed from the CLI,
- the NPC feels somewhat natural,
- the game remains coherent under varied wording,
- invalid inputs fail safely,
- logs make debugging easy,
- the repository remains small and clean.

## Final deliverable format

When done, provide:

1. a short summary of what was built,
2. the repo tree,
3. run instructions,
4. known limitations,
5. suggested next improvements.

Now execute this plan and build the prototype.

