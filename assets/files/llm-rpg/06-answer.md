Great question — let me check what Qwen3.5 brings to the table and whether it changes the recommendation.Excellent catch, Javi — you're absolutely right to push on this. Here's the deal:

## Why Qwen3.5 is the better choice (and why I initially missed it)

Qwen3.5 dropped very recently — the small models (0.8B, 2B, 4B, 9B) were released on March 2, 2026, and the medium models (27B, 35B-A3B, 122B-A10B) on February 24, 2026. My initial recommendation was stale. You should absolutely use Qwen3.5 instead.

The improvements are significant. Qwen3.5 models are multimodal hybrid reasoning LLMs that deliver the strongest performance for their sizes, supporting 256K context across 201 languages with thinking/non-thinking modes. And the architectural innovations matter: Gated Delta Networks combined with sparse Mixture-of-Experts deliver high-throughput inference with minimal latency.

## The revised recommendation

The big news for your setup is the **Qwen3.5-35B-A3B** — this is a MoE model with 35B total parameters but only **3B active per token**. It routes each token through 3B of its 35B total parameters and runs on 8GB+ VRAM GPUs with GGUF quantization. It surpasses the previous 235B flagship across most benchmarks. That's a staggering efficiency gain.

However, there's one important caveat: **MoE models load ALL parameters into memory, not just the active ones**. The Q4_K_M GGUF is about ~20 GB, which won't fit entirely in your 16 GB VRAM. You'd need partial CPU offload, and because the model is a 3B active MoE, CPU expert offload still gives good generation rates with very large context available. That's actually great news — MoE models handle CPU offload much better than dense models because the active computation per token is small.

That said, there's also the **Qwen3.5-27B** (dense), where Q4_K_M is 16.7 GB. This is too tight for 16 GB VRAM with KV cache overhead, so it'd also require partial offload — but being a dense model, the offload penalty is harsher.

There's also a **maturity concern**: there was a recent llama.cpp issue with Qwen3.5-35B-A3B reporting "unknown model architecture: qwen35moe", and the minimum llama.cpp version to run it is b8148 and above due to a graph error correction. So make sure you're on the latest build.

## Updated recommendation

| Role | Model | Quant | File size | Runs on | Notes |
|---|---|---|---|---|---|
| **Roleplay** | **Qwen3.5-9B** | Q5_K_M | ~7 GB | GPU (fully) | Safe fit, fast, latest gen |
| Roleplay (ambitious) | Qwen3.5-35B-A3B | Q4_K_M | ~20 GB | GPU + CPU offload | 3B active, great quality, needs latest llama.cpp |
| **Intent classifier** | **Qwen3.5-0.8B** | Q8_0 | <1 GB | CPU | Newest small model |
| Intent (if 0.8B too weak) | Qwen3.5-4B | Q4_K_M | ~2.5 GB | CPU | Still fast on your Ryzen |

My suggestion: start with **Qwen3.5-9B on GPU** for roleplay — it fits cleanly in 16 GB with plenty of room for KV cache at 8K+ context, and being the latest generation it'll outperform Qwen3 14B despite the smaller parameter count. Then experiment with the 35B-A3B MoE variant with expert offload to CPU once you've confirmed llama.cpp support is stable on your setup. The 35B-A3B is the exciting option here — 3B active parameters but punching far above its weight.
