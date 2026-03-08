Created the markdown document: [project_plan_detective_llm_agents.md](sandbox:/mnt/data/project_plan_detective_llm_agents.md)

Main recommendations I baked into it:

* Build a **deterministic symbolic engine** first, then add LLMs only for routing, NPC dialogue, and phrasing. That matters more for coherence than model choice.
* For local models, use **Qwen as the default family**. Qwen presents **Qwen3** as its latest major open family, also exposes newer **Qwen3.5** artifacts such as `Qwen3.5-9B`, and positions **QwQ-32B** as its reasoning-specialized line. ([GitHub][1])
* For local serving, the plan assumes **llama.cpp**, which supports local quantized inference, an OpenAI-compatible server, and schema-constrained JSON outputs. ([GitHub][2])
* For commercial spot checks, I recommended **GPT-5 mini** and **Claude Sonnet 4.6** as the main price/performance baselines, with **GPT-5.4** as the premium reference and **Claude Haiku 4.5** as the cheap fast baseline. Current pricing pages describe GPT-5 mini as the cheaper GPT-5 variant and Sonnet 4.6 as Anthropic’s balance-of-cost/speed/intelligence option. ([openai.com][3])
* I also included **Mistral Small / Devstral** as the non-Qwen local comparison, since Mistral currently presents Devstral as its coding-agent open family and Mistral Small as its compact open family. ([mistral.ai][4])

If you want, next I can turn this into a **single Codex master prompt** that tells GPT-5.4 exactly how to run the builder/reviewer/validator loop.

[1]: https://github.com/QwenLM/Qwen3 "GitHub - QwenLM/Qwen3: Qwen3 is the large language model series developed by Qwen team, Alibaba Cloud. · GitHub"
[2]: https://github.com/ggml-org/llama.cpp "GitHub - ggml-org/llama.cpp: LLM inference in C/C++ · GitHub"
[3]: https://openai.com/api/pricing/ "Pricing | OpenAI"
[4]: https://mistral.ai/models?utm_source=chatgpt.com "Models - from cloud to edge"
