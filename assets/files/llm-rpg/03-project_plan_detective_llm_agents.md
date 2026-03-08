# Project plan: local LLM-agent text detective game

## 1) Project goal

Build a **weekend prototype** of a **single-player CLI detective/puzzle game** in Python, with a **small handcrafted world**, **one key NPC**, and **light LLM improvisation**.

The project has three parallel goals:

1. Build a small but coherent conversational game.
2. Practice building an application that uses multiple LLM agents for different development tasks.
3. Evaluate small open-source local models against selected commercial models for this specific kind of application: **interaction logic, coherence, and narrative consistency**.

This is **not** a production project. The priority is:

1. architectural cleanliness
2. coherence and consistency of the game logic
3. simplicity of implementation
4. low friction for iterating on models and prompts

---

## 2) Recommended product shape

Do **not** build an open-ended “LLM game.”

For v1, build a **rule-grounded game with LLM-assisted dialogue**.

That means:

- The world state is symbolic and deterministic.
- The puzzle logic is symbolic and deterministic.
- The LLM is mainly used for:
  - NPC dialogue style and improvisation
  - intent interpretation
  - phrasing/environment narration
  - light adjudication when player input is ambiguous
- The LLM is **not** the source of truth for facts.

This is the single most important design choice for coherence.

### Why

If the model owns facts, clues, inventory, progression, and puzzle state, the prototype will become inconsistent quickly. The game should instead be a **small state machine with narrative skin**.

---

## 3) The right v1

### v1 game loop

A compact location-escape scenario:

- One small location with 3–5 interactable areas
- One NPC who knows a crucial fact
- One locked exit
- One simple puzzle chain
- One final action to escape

### Minimal story template for v1

Use this as the prototype content so Codex does not have to invent too much:

**Setting:** a caretaker’s office inside an old municipal archive after closing time.

**Player goal:** get out of the archive.

**Core obstacle:** the exit door is locked with a keypad.

**Key puzzle chain:**

- The player explores the office.
- They find clues suggesting the code is tied to a specific archived case file.
- The NPC caretaker knows the missing piece, but is reluctant to say it directly.
- Through conversation, the player learns the final fact needed to infer the code.
- The player enters the code and exits.

### World pieces

Keep it intentionally small:

- **Rooms / zones**
  - desk
  - filing cabinet
  - bulletin board
  - keypad door
  - NPC position

- **Objects**
  - note with partial clue
  - case folder
  - desk calendar
  - locked drawer or misleading clue

- **NPC**
  - knows one required fact
  - has a personality and motive for not stating it immediately
  - can hint, deflect, confirm, deny, and react emotionally

### Example concrete mystery

- Case file number: `314`
- Door code rule: “case number + final inspection year digit”
- The office materials reveal the case number
- The NPC reveals, indirectly, that the final inspection happened in `2018`
- Therefore the code is `3148`

This is intentionally simple. The goal is not puzzle difficulty. The goal is testing **interactive coherence**.

---

## 4) Architecture principles

### 4.1 Hard separation: engine vs language layer

Split the system into two layers.

#### A. Game engine layer (authoritative)
Owns:
- world state
- inventory
- discovered clues
- puzzle state
- allowed actions
- win condition
- truth about facts

#### B. Language layer (non-authoritative)
Owns:
- dialogue generation
- intent classification support
- environment phrasing
- graceful handling of ambiguous player language

### 4.2 Never let generated text mutate state directly

All state changes should go through explicit game commands like:

- `LOOK(target)`
- `TALK_TO(npc, utterance)`
- `USE(item, target)`
- `INSPECT(target)`
- `ENTER_CODE(code)`
- `TAKE(item)`
- `ASK(npc, topic)`

The model can propose an interpretation, but the engine decides whether it is valid.

### 4.3 Keep prompts small and state explicit

For local models, quality drops quickly when prompts become bloated.

So each prompt should receive only:
- current room / visible objects
- relevant known facts
- relevant NPC memory
- current puzzle stage
- recent dialogue turns
- response schema

Not the entire game transcript.

### 4.4 Structured outputs everywhere

Every agent that affects runtime behavior should emit strict JSON.

Examples:

```json
{
  "intent": "talk",
  "target": "caretaker",
  "topic": "inspection_year",
  "confidence": 0.91,
  "rationale": "The player asks what year the inspector came back."
}
```

```json
{
  "speech": "You are asking the wrong question. The year mattered less than the man who signed it.",
  "tone": "guarded",
  "reveals_fact_ids": ["hint_inspection_year"],
  "contradicts_world": false
}
```

### 4.5 Prefer controlled improvisation

LLM improvisation should be constrained to:
- wording
- tone
- hint phrasing
- mild reactions
- clarifying ambiguous player intent

Do **not** allow unconstrained improvisation of:
- new objects
- new clues
- new backstory facts that matter mechanically
- new puzzle solutions
- hidden state changes

---

## 5) Runtime architecture for the game

### 5.1 Main modules

Recommended Python modules:

```text
/game
  main.py
  loop.py
  models.py
  state.py
  actions.py
  parser.py
  engine.py
  dialogue.py
  npc.py
  prompts.py
  schemas.py
  memory.py
  content/
    world.yaml
    npc.yaml
    puzzle.yaml
  llm/
    client.py
    llama_cpp_client.py
    commercial_client.py
  tests/
    test_engine.py
    test_parser.py
    test_dialogue_guardrails.py
    test_win_path.py
    test_no_illegal_reveals.py
/docs
  project_plan.md
  architecture.md
  prompts.md
  eval_notes.md
```

### 5.2 Core flow per player turn

```text
player input
  -> intent router
  -> action candidate JSON
  -> engine validates action
  -> engine mutates symbolic state if valid
  -> response composer asks LLM for wording / NPC response if needed
  -> final text shown to player
```

### 5.3 Recommended runtime components

#### Intent Router Agent
Purpose:
- classify whether the player is interacting with the environment or the NPC
- identify target and topic/action
- produce a structured candidate action

This should be a small, cheap model.

#### NPC Dialogue Agent
Purpose:
- generate the caretaker’s response
- follow persona
- decide whether to hint, evade, confirm, or reveal
- respect current allowed knowledge boundaries

This is the most important runtime model.

#### Response Composer / Narrator Agent
Purpose:
- turn engine results into natural prose
- make environment responses less robotic
- summarize failed or successful actions elegantly

Can be the same model as the router if necessary, but it is cleaner as a separate abstraction.

### 5.4 Optional fourth runtime component: Consistency Filter

Before showing an NPC reply, run a cheap rule/validator step that checks:
- no forbidden fact was revealed too early
- no contradiction with known facts
- no mention of nonexistent items/rooms
- no direct giveaway of the final code unless allowed

This can be implemented mostly as Python rules, not an LLM.

That is better for coherence than adding another agent.

---

## 6) Development-agent plan for Codex

Use **sequential agents**, but keep the system lean.

The best result for this project is usually:

1. one builder agent
2. one reviewer agent
3. one validator/test agent
4. optionally one content/prompt specialist agent

Do **not** create a large society of agents. For a weekend prototype it adds noise faster than value.

### 6.1 Recommended development agents

#### Agent 1: Architect/Builder
Responsibilities:
- create repo structure
- implement engine and data models
- implement llama.cpp client
- implement CLI loop
- integrate prompts and schemas
- write initial tests

Success condition:
- the game runs end-to-end
- the win path works deterministically

#### Agent 2: Reviewer/Refactorer
Responsibilities:
- inspect generated code for architectural drift
- reduce coupling
- simplify interfaces
- eliminate prompt leakage into engine logic
- improve naming and module boundaries

Success condition:
- cleaner abstractions
- fewer fragile code paths
- less duplicated logic

#### Agent 3: Validator/Test Agent
Responsibilities:
- add and run tests
- simulate transcripts
- test invalid inputs
- test forbidden early reveals
- test state transitions
- verify failure modes

Success condition:
- main path stable
- no state corruption from malformed input
- no illegal shortcut to victory

#### Optional Agent 4: Prompt/Content Agent
Responsibilities:
- improve NPC persona prompt
- improve intent schema prompts
- tune narration style
- generate a few synthetic playthroughs for manual review

Success condition:
- more natural dialogue without hurting consistency

### 6.2 Development order

Codex should use these agents in this order:

1. **Builder** implements deterministic engine first.
2. **Builder** adds structured LLM wrappers.
3. **Builder** wires runtime agents.
4. **Validator** adds tests and scripted playthroughs.
5. **Reviewer** refactors after the first working version.
6. **Prompt agent** tunes language quality only after correctness exists.

That order matters. If prompting starts before the engine is stable, the project will drift.

---

## 7) Model recommendations

### 7.1 Local open-source models

For your hardware and this project, use **Qwen as the default family**, with **one non-Qwen comparison**.

#### Primary recommendation

**Qwen 3 / Qwen 3.5 small-to-mid instruct models** for runtime and prompt iteration.

Why:
- strong instruction following
- good structured output behavior
- good enough reasoning for intent routing and bounded dialogue
- practical size for local llama.cpp usage

#### Secondary recommendation

**QwQ-32B** as a reasoning-oriented comparison model for offline experiments, prompt design, or difficult dialogue adjudication.

Why:
- reasoning-specialized
- useful as a higher-capability local comparison
- probably too heavy to be the default runtime model for a fast CLI prototype, but useful as a benchmark or “quality mode” option

#### Best non-Qwen comparison

**Mistral Small 3.x** or **Devstral Small** as the comparison family.

Why:
- useful to compare style, tool discipline, and coding/helpfulness behavior
- gives you at least one strong non-Qwen baseline

#### De-prioritize for this project

- giant local reasoning models as the main runtime engine
- very tiny sub-4B models for the NPC if you care about dialogue consistency
- multimodal models, because this project is text-only

### 7.2 Practical local model roles

Use different models for different jobs.

#### Suggested local runtime split

- **Intent router:** 7B–9B instruct model
- **NPC dialogue:** 8B–14B instruct model
- **Narrator/composer:** same as router or same as NPC model
- **Offline “judge” experiments:** QwQ-32B or strongest local alternative you can run acceptably

### 7.3 Commercial comparison models

You said you want the versions with the best price/performance relationship for this task.

For this use case, the comparison set should be small:

#### OpenAI
- **GPT-5 mini** for economical structured reasoning and development assistance
- **GPT-5.4** as the premium reference model, but not the default comparison due to price

#### Anthropic
- **Claude Sonnet 4.6** as the best balanced comparison
- **Claude Haiku 4.5** as the cheap fast baseline

### 7.4 Recommendation summary

If the goal is to learn something useful from the comparison rather than create a giant benchmark, use this matrix:

#### Local
- Qwen small/mid instruct: default runtime
- QwQ-32B: quality mode / offline comparison
- Mistral Small or Devstral: non-Qwen comparison

#### Commercial
- GPT-5 mini: main OpenAI baseline
- Claude Sonnet 4.6: main Anthropic baseline
- optional premium spot-check: GPT-5.4

---

## 8) Evaluation plan

Your ranking is:
1. coherence
2. narrative consistency
3. fun

Design the evaluation around **play sessions and notes**, not a formal benchmark.

### 8.1 Manual playtest sheet

For each model configuration, record:

- Did the NPC stay in character?
- Did the NPC avoid inventing facts?
- Did the NPC reveal clues at the right pace?
- Did the environment responses match actual world state?
- Did the game remain solvable without arbitrary guessing?
- Did any response contradict previous dialogue or discovered clues?
- Was the conversation enjoyable enough to continue?

Use a simple 1–5 score for:
- coherence
- consistency
- fun

And keep free-form notes.

### 8.2 Test scenarios to play manually

At minimum, test these:

1. **Golden path**
   - player explores correctly
   - asks the right questions
   - solves puzzle

2. **Interrogation-heavy path**
   - player talks a lot before exploring
   - NPC must not reveal too much too early

3. **Environment-heavy path**
   - player ignores the NPC for a while
   - game should still hint the NPC matters

4. **Adversarial path**
   - player asks for the code directly
   - player asks about nonexistent objects
   - player repeats or spams inputs
   - player tries to break immersion with meta questions

5. **Ambiguous input path**
   - player uses vague natural language
   - router should classify well enough without breaking state

### 8.3 What to compare across models

For each model setup, compare:

- number of contradictions observed
- number of illegal reveals
- number of parser/router failures
- average subjective coherence score
- average subjective consistency score
- rough latency feel
- estimated cost for commercial runs

Do **not** overmeasure. You are trying to learn which setups feel robust.

---

## 9) Prompting strategy

### 9.1 Router prompt

Router should behave like a classifier, not a storyteller.

Its prompt should include:
- current visible entities
- valid action types
- recent turn context
- explicit instruction to return JSON only
- instruction to prefer `unknown` over guessing

### 9.2 NPC prompt

NPC prompt should include:
- persona
- what the NPC knows
- what the NPC is allowed to reveal now
- what the NPC must never reveal yet
- current player relationship state
- recent dialogue window
- required JSON schema

### 9.3 Narrator prompt

Narrator should be tightly constrained:
- no new facts
- no unsupported implications
- describe only engine-confirmed outcomes
- keep text short

### 9.4 Important runtime rule

If the model output is malformed or low confidence:
- fall back to deterministic text
- never let malformed output corrupt state

---

## 10) Guardrails that matter most

These matter more than fancy prompts.

### 10.1 Fact registry

Store all mechanically important facts as IDs, for example:

- `case_number_314`
- `inspection_year_2018`
- `door_code_rule`
- `door_code_3148`

NPC dialogue is allowed to reveal only facts whose IDs are in `allowed_reveal_fact_ids`.

### 10.2 Forbidden content checks

Before accepting NPC output, verify:
- no forbidden fact IDs were revealed
- no direct mention of final code before allowed
- no mention of objects not in state
- no contradiction of registered facts

### 10.3 Dialogue memory should be selective

Do not pass full transcript history forever.

Instead keep:
- last N turns
- discovered facts
- player trust/pressure level
- hint stage

### 10.4 Engine must own progression

Example:
- speaking with NPC does not magically unlock the door
- only `ENTER_CODE(3148)` unlocks it
- inventory and discovery are explicit, not implied by prose

---

## 11) Weekend implementation roadmap

### Phase 0: setup (1–2 hours)

Deliverables:
- Python project skeleton
- CLI entrypoint
- content files for world/NPC/puzzle
- simple llama.cpp client wrapper
- JSON schema utilities

### Phase 1: deterministic core (3–5 hours)

Deliverables:
- state models
- command/action types
- engine reducer for state transitions
- symbolic puzzle logic
- content loading from YAML/JSON
- deterministic fallback responses

Exit criteria:
- the whole game is playable without any LLM, even if text is plain

### Phase 2: runtime LLM integration (3–5 hours)

Deliverables:
- router agent
- NPC dialogue agent
- narrator/composer
- prompt templates
- output validation

Exit criteria:
- the game is playable with local model-backed interaction
- malformed model outputs fail safely

### Phase 3: tests and hardening (2–4 hours)

Deliverables:
- golden-path test
- invalid-input tests
- forbidden-reveal tests
- state integrity tests
- manual playtest notes template

Exit criteria:
- prototype survives normal play without obvious contradictions

### Phase 4: comparison runs (optional, after v1 works)

Deliverables:
- small config system to swap models/prompts
- 3–5 manual play sessions per model
- notes document comparing coherence/consistency/fun

Exit criteria:
- clear conclusion on which local model is best for runtime NPC/dialogue in this project

---

## 12) What Codex should build first

Give Codex this implementation priority order:

1. data schemas
2. world state and engine reducer
3. deterministic CLI gameplay
4. content files
5. local llama.cpp client
6. router JSON output
7. NPC JSON output
8. validation layer
9. tests
10. prompt tuning

If Codex starts by writing fancy prompts and dialogue first, redirect it.

---

## 13) Concrete acceptance criteria for v1

The prototype is done when all of this is true:

- The game runs from the CLI.
- The player can inspect the environment, talk to the NPC, and enter actions in natural language.
- The system reliably distinguishes environment interaction from NPC interaction.
- The game state is deterministic and inspectable.
- The NPC does not reveal forbidden facts too early.
- The puzzle is solvable in a normal playthrough.
- Invalid inputs do not crash the game.
- The model can be swapped via config.
- There are a few basic automated tests.
- There is a short document explaining how to run the prototype and switch models.

---

## 14) What not to build in v1

Avoid all of this initially:

- multiple rooms with free navigation
- multiple NPCs
- inventory-heavy puzzles
- procedural story generation
- long-term memory systems
- autonomous in-game planning agents
- complex tool-use frameworks
- networked UI
- production telemetry stack
- elaborate benchmark harnesses

All of these are attractive distractions.

---

## 15) Recommended Codex workflow

Use a disciplined sequential loop.

### Step A
Architect/Builder creates the minimum deterministic version.

### Step B
Validator adds tests and catches broken assumptions.

### Step C
Reviewer refactors interfaces and removes unnecessary complexity.

### Step D
Prompt/Content agent improves the language layer without touching the engine.

### Step E
Run manual playtests and record notes.

Then repeat only on the weakest part.

---

## 16) Suggested instructions for GPT 5.4 in Codex

Use something like this as the controlling brief:

> Build a weekend prototype of a single-player Python CLI detective/puzzle game.
> 
> The game must use a deterministic symbolic engine for world state and puzzle logic, and LLMs only for intent routing, NPC dialogue, and response wording.
> 
> Prioritize coherence and narrative consistency over ambition. Keep the world tiny: one location, one key NPC, one locked exit, one simple puzzle chain.
> 
> Implement the project sequentially using separate roles: builder, reviewer, validator, and optionally prompt/content specialist. Do not create a large multi-agent architecture.
> 
> Use clean module boundaries. Never let generated text directly mutate state. All state changes must pass through explicit validated actions.
> 
> Build the deterministic engine first, then add llama.cpp integration with structured JSON outputs and validation. Add tests for golden path, invalid inputs, forbidden early reveals, and win condition.
> 
> Stop adding complexity once v1 is coherent, playable, and easy to swap across models.

---

## 17) Final recommendation

For this project, the winning strategy is:

- **small handcrafted puzzle**
- **symbolic engine**
- **LLM only where language helps**
- **3 core development agents, sequentially**
- **Qwen as the default local family**
- **one non-Qwen local comparison**
- **one OpenAI and one Anthropic commercial baseline**
- **manual playtesting instead of over-engineered evals**

That will teach you something real about:
- agent-assisted development
- local model behavior
- what parts of a game should remain deterministic
- which models actually help coherence versus just sounding fluent

---

## 18) Current model notes and references

These notes are here only to justify the model choices and may need updating later.

- Qwen describes **Qwen3** as the latest addition to the Qwen family and positions it as their most advanced open series.
- Qwen also exposes newer **Qwen3.5** artifacts, including `Qwen3.5-9B`.
- QwQ is explicitly positioned as Qwen’s reasoning-specialized line, with **QwQ-32B** described as competitive with strong reasoning models.
- llama.cpp supports local inference, quantized models, an OpenAI-compatible server, schema-constrained JSON output, and function calling/tool use.
- Anthropic currently positions **Sonnet 4.6** as the balance-of-cost/speed/intelligence option and **Haiku 4.5** as the cost-efficient fast option.
- OpenAI currently positions **GPT-5 mini** as the cheaper/faster GPT-5 variant and **GPT-5.4** as the more capable premium model.
- Mistral currently positions **Devstral** as a model family for coding agents and **Mistral Small** as its compact open family.

