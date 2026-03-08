Let me look at your specs and research the current state of open-source models to give you a solid recommendation.

Your rig: Ryzen 9 7900 (24 threads), 64 GB RAM, RTX 5060 Ti (which should have 16 GB VRAM), plus the integrated Raphael iGPU.

Let me check what's currently available.Now let me check the latest on Qwen3 and Qwen3.5 specifically for your use case, and also verify the 5060 Ti VRAM situation (8GB vs 16GB matters a lot here).Now I have a clear picture. Let me check one critical detail — whether your 5060 Ti is 8GB or 16GB, since both variants exist. From the screenshot I can see "NVIDIA GeForce RTX 5060 Ti" but not the VRAM amount. Let me give you recommendations for both scenarios, with the 16GB being more likely since that's the more common SKU.

Javi, here's my analysis. First, one important question: **do you have the 8GB or 16GB variant of the RTX 5060 Ti?** The recommendation changes significantly based on that. I'll lay out both scenarios.

---

## Your resource budget

You have 16 GB VRAM (GPU) + 64 GB system RAM. The key constraint is that both models need to be loaded simultaneously, so they need to share your VRAM, or one lives on GPU and the other on CPU/RAM.

The approach that makes the most sense: **put the big roleplay model on the GPU for fast generation, and run the small intent model on CPU** (from your 64 GB RAM). The intent classifier only needs to produce a short structured output — a few tokens — so CPU speed is perfectly fine for that.

---

## Model recommendations

### Roleplay model (GPU): **Qwen3 14B** (Q4_K_M) or **Qwen 2.5 32B** (Q4_K_M)

If you have the **16GB 5060 Ti**: Go with **Qwen3 14B at Q5_K_M** (~10-11 GB), leaving comfortable room for KV cache with a decent context window (~8K tokens). This is a very strong model for creative/conversational tasks and it supports thinking mode you can toggle on or off. Alternatively, you could push to **Qwen 2.5 32B at Q4_K_M** (~20 GB), but that would require spilling layers to RAM and you'd see significant speed drops. I'd recommend the 14B fully on GPU — you'll get 30+ tokens/second which feels great for interactive roleplay.

If you have the **8GB 5060 Ti**: Your best bet is **Qwen3 8B at Q4_K_M** (~5-6 GB), which fits entirely in VRAM with room for KV cache. It's still remarkably capable for roleplay with good prompting. With Q4_K_M quantization, an 8B model fits comfortably on an 8GB GPU with reasonable context lengths.

Why Qwen3? It's currently one of the strongest open-source model families at every size class. Qwen3 models are strong on reasoning, code, and multilingual tasks, with native 32K context extendable to 131K with YaRN. The built-in `/think` and `/no_think` toggles are handy too — you can disable thinking mode for roleplay to get faster, more natural responses.

### Intent model (CPU): **Qwen3 0.6B** or **Qwen3 4B** (Q4_K_M)

For intent classification, you don't need a creative powerhouse — you need a model that reliably outputs structured JSON with an intent label. **Qwen3 0.6B** at Q8_0 is under 1 GB and runs quickly on CPU. With a well-crafted system prompt like:

```
You classify user intent for a game engine. Given the user's text, respond ONLY with JSON: {"intent": "...", "confidence": 0.0-1.0, "entities": {...}}
Possible intents: move, attack, talk, examine, use_item, inventory, quit
```

...a 0.6B model can handle this reliably. If you find it's not accurate enough, step up to **Qwen3 4B** (~2.5 GB at Q4_K_M on CPU), which is still very fast on your 24-thread Ryzen 9 7900 and gives noticeably better instruction following.

---

## Architecture: two `llama-server` instances

The standard approach is to start each model in a separate llama-server instance on a different port. Alternatively, llama.cpp server now ships with router mode, which lets you dynamically load, unload, and switch between multiple models without restarting. But for your case where both need to be always-available, two instances is cleaner:

```bash
# Roleplay model — full GPU offload
llama-server \
  -m qwen3-14b-q5_k_m.gguf \
  -ngl 999 \
  -c 8192 \
  --port 8080

# Intent model — CPU only
llama-server \
  -m qwen3-0.6b-q8_0.gguf \
  -ngl 0 \
  -c 2048 \
  --port 8081
```

Your game engine then hits `localhost:8081` for intent classification (fast, short responses) and `localhost:8080` for the roleplay character's dialogue.

---

## Summary table

| Role | Model | Quant | Size | Runs on | Speed |
|---|---|---|---|---|---|
| Roleplay (16GB GPU) | Qwen3 14B | Q5_K_M | ~11 GB | GPU | ~30+ tok/s |
| Roleplay (8GB GPU) | Qwen3 8B | Q4_K_M | ~5.5 GB | GPU | ~40+ tok/s |
| Intent classifier | Qwen3 0.6B | Q8_0 | ~0.8 GB | CPU | Fast enough |
| Intent (if 0.6B too weak) | Qwen3 4B | Q4_K_M | ~2.5 GB | CPU | Still good |

The Qwen3 family gives you a consistent prompting style and chat template across both models, which simplifies your game engine code. And with `/no_think` mode, you avoid the overhead of chain-of-thought reasoning in the roleplay model, keeping responses snappy and in-character.