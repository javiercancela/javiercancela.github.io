I'll read the uploaded plan first.This is a solid plan, Javi. Whoever generated it clearly understood the core tension in this kind of project — the temptation to let the LLM own too much state — and made the right call early. Let me give you an honest assessment.

**What's strong:**

The architectural heart of the plan (sections 4 and 5) is excellent. The hard separation between a deterministic engine and a non-authoritative language layer is the single most important decision, and it's explained clearly with good rationale. The fact registry + forbidden-reveal checks (section 10) are a pragmatic way to enforce coherence without over-engineering it. The structured JSON output requirement for every agent is also the right call, especially given that you'll be testing small local models where output discipline is the first thing to degrade.

The implementation roadmap (section 11) is well-sequenced. Building the game as a fully playable deterministic system *before* adding any LLM is exactly right — it means you always have a working fallback, and you can clearly isolate whether bugs come from the engine or the language layer.

The "what not to build" list (section 14) is refreshingly disciplined.

**What I'd push back on or refine:**

First, the development agent plan (section 6, which got truncated in my view but I can see the structure) describes Architect/Builder, Validator, Reviewer, and Prompt/Content as four roles. For a weekend prototype being built by Codex, three is probably the right number in practice. The Reviewer role (refactoring interfaces, removing complexity) is the one most likely to waste cycles — Codex will spend tokens reshuffling code that doesn't need it yet. I'd fold review into the validator: have the validator check both correctness *and* interface cleanliness in one pass. Save the dedicated review pass for after v1 works.

Second, the model notes (section 18) mention Qwen3.5-9B but don't give a clear primary recommendation for the router agent vs. the NPC agent. Given your 16GB VRAM, you should be explicit about this. The router is a classifier — it should use the smallest model that reliably outputs valid JSON (Qwen3-4B quantized, or even Qwen3-1.7B if it handles the schema). The NPC agent is where quality matters most; that's where you want Qwen3.5-9B or QwQ-32B (Q4 quantized to fit in your RAM). Running the same large model for both routing and dialogue will hurt latency for no gain.

Third, the plan doesn't mention how to handle llama.cpp's JSON grammar/schema constraining feature, which is critical for your use case. You should explicitly instruct Codex to use llama.cpp's `--grammar` or GBNF schema support to force valid JSON from the local models. Without it, small models will regularly emit malformed outputs and you'll spend time debugging parsing rather than testing game coherence.

Fourth, the evaluation approach (section 8) is right to stay manual, but it's missing a simple logging hook. Even for a weekend prototype, having the game automatically log each turn's raw model output alongside the engine's state transitions into a JSONL file would save you enormous time when comparing models. You'd be able to replay sessions after the fact instead of relying purely on memory and handwritten notes.

Fifth, the commercial model baselines mention Sonnet 4.6 and GPT-5 mini, but the plan doesn't specify *how* you'd call them. Since the game is built around a llama.cpp client, you'd need a thin adapter that speaks the same interface but hits the OpenAI/Anthropic APIs. The plan should explicitly call this out as a deliverable in Phase 0 or Phase 2 — otherwise Codex might build the llama.cpp client in a way that's hard to swap.

**Minor things:**

The story template (section 3) is fine for v1 but slightly generic. You might enjoy it more if the caretaker has a stronger personality hook — maybe they're obsessively protective of the archive's records, or they suspect the player of being a journalist. A character with a clear *reason* to resist will make the NPC dialogue testing more interesting and expose more about how well models handle motivated evasion vs. simple deflection.

The Codex instruction block (section 16) is good but could be tighter. It says "separate roles: builder, reviewer, validator" but doesn't specify the loop discipline. Add something like: "Complete each role's pass fully before switching. Do not interleave building and reviewing in the same step."

**Overall verdict:** This is a well-thought-out plan that's actually scoped for a weekend, which is rare. The architecture is sound, the priorities are right, and the guardrails against scope creep are explicit. With the refinements above — especially the VRAM-aware model assignments, grammar-constrained JSON, and a turn-logging hook — it should give you a clean foundation for both the game and the model comparison work.

Want me to produce a revised version of the plan incorporating these changes?
