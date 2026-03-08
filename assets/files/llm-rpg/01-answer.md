Need a few decisions first. These will change the plan a lot.

1. **Game**

   * What kind of conversational game: parser IF, choice-based narrative, NPC dialogue sim, detective/interrogation, RPG, social deduction, something else?
   * Single-player only?
   * Replayability or mostly handcrafted story?
   * Do you want the game world/rules to be mostly symbolic/deterministic, or do you want heavy LLM improvisation?

2. **Scope**

   * What is the smallest acceptable v1?
   * Do you want a short polished game, or a rough game mainly to test agent workflows and models?
   * Target timeline: weekend prototype, 2–4 weeks, or longer?

3. **Tech stack**

   * Preferred language: Python?
   * CLI only, or web app too?
   * Do you want local inference through `llama.cpp`, `vLLM`, `Ollama`, or something else?
   * Do you want the orchestration framework to be minimal/custom, or use something like LangGraph / PydanticAI / AutoGen / CrewAI?

4. **Agent architecture**

   * How many coding agents do you want in practice: 2–3 or a larger pipeline?
   * Should agents run sequentially under one orchestrator, or independently with git branches / PR-style review?
   * Do you want one agent to be a strict non-LLM validator using tests/lints only?

5. **Models to evaluate**

   * Which local small open-source models do you want included?
   * Which commercial models do you want as baselines?
   * Is the goal code quality, reasoning, latency, cost, instruction-following, or game-writing quality?

6. **Evaluation**

   * What do you want to measure for the **game**: fun, coherence, bug rate, narrative consistency, latency?
   * What do you want to measure for the **agents**: number of iterations, test pass rate, regressions, token/cost usage?
   * Do you want a benchmark suite with fixed tasks and rubrics?

7. **Constraints**

   * Fully local for open models?
   * Any budget cap for commercial API usage?
   * Any hardware limits I should assume from your machine?
   * Is internet access allowed during development agents’ runs?

8. **Code quality / delivery**

   * Do you want this planned as a real production-style repo with CI, docs, eval harness, telemetry, and experiment tracking?
   * Should Codex be instructed to optimize for speed of delivery or architectural cleanliness?

9. **Game content generation**

   * Do you want the world/story authored manually first, then LLM-assisted implementation?
   * Or should some agents generate lore, NPCs, quests, test transcripts, etc.?

10. **Prompting Codex**

* Do you want the final markdown to be:

  * a project plan for you,
  * or a direct execution spec addressed to GPT 5.4 in Codex,
  * or both?

Once you answer, I’ll turn it into a markdown document with:

* project phases
* recommended repo structure
* agent roles and handoff rules
* model evaluation plan
* milestone roadmap
* acceptance criteria
* a Codex execution prompt/playbook
