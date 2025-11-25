---
layout: post
title:  Local LLMs II - Requirements to run a local LLM
subtitle: In which I try to figure out what I need to run an LLM on my computer
date: 2025-10-03
tags:
  - local-llm
image: /assets/images/2025-09-19-local-llm-setup/2025-11-25-19-39-29.png
---

The first post is [here](post_url 2025-09-19-local-llm-setup).

I want to run local models on my PC, and I want to do it while learning as much as possible in the process. What do I need to do so?

# 1. The model

To run a model, we need the model itself. This model will be a file, or a set of files, detailing the structure of the model (layers, sizes, types) as well as its values. Also, some metadata with information about the model.

<figure>
  <img src="/assets/images/2025-11-08-local-llm-options/2025-10-09-21-12-53.png" alt="GGUF Format" />
  <figcaption>From <a href="https://medium.com/@vimalkansal/understanding-the-gguf-format-a-comprehensive-guide-67de48848256">Understanding the GGUF Format: A Comprehensive Guide</a></figcaption>
</figure><br/>

There are different formats to pack a model and distribute it: GGUF is the most common, but there are several different options, some of which  [this Hugging Face article](https://huggingface.co/blog/ngxson/common-ai-model-formats) describes.

## 1.1. Quantization

The size of a model is determined by its number of [trainable parameters](https://www.ibm.com/think/topics/llm-parameters). A typical open-weights model suitable to run on a personal PC has a few billion parameters. For example, [`Qwen/Qwen2.5-7B-Instruct`](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct) has 7 billion (that's the 7B part, although technically it has 7.61B). This model [uses 16-bit floating point numbers](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/model.safetensors.index.json), so 2 bytes per parameter means the model size is 15.2GB. All this data has to be loaded in memory, ideally into the GPU VRAM. (As a reference, state-of-the-art commercial LLMs like GPT-5 likely have trillions of parameters.)

<figure>
  <img src="/assets/images/2025-11-08-local-llm-options/2025-10-09-21-15-26.png" alt="bartowski/Qwen2.5-7B-Instruct-GGUF" />
  <figcaption>Quantizations in <a href="https://huggingface.co/bartowski/Qwen2.5-7B-Instruct-GGUF">bartowski/Qwen2.5-7B-Instruct-GGUF</a></figcaption>
</figure><br/>


To make it easier to fit these models in consumer-level GPUs, these parameters can be [quantized](https://huggingface.co/docs/optimum/en/concept_guides/quantization): we reduce the precision of the parameters to make the model smaller at the expense of some accuracy.

The GGUF format usually includes several different quantized versions inside the same model file. For example, [this GGUF version](https://huggingface.co/models?other=base_model:quantized:Qwen/Qwen2.5-7B-Instruct) of `Qwen/Qwen2.5-7B-Instruct` contains quantizations ranging from 8 bits (8.1 GB) to 2 bits (3.02 GB).

## 1.2. Tensors

Parameters in a neural network are represented as tensors. We can think of tensors as the general term for scalars, vectors, matrices, and groups of numbers of more than 2 dimensions. So running inference with a model is just adding and multiplying tensors. Adding and multiplying tensors is [conceptually very simple](https://betterexplained.com/articles/matrix-multiplication/), but computationally very expensive. GPUs are way more capable of doing this than CPUs because they can parallelize the floating-point operations needed. Optimizing these operations is the key aspect of this setup. Generating a few tokens per second requires billions of operations per second, and any minimal improvement may be significant.

<figure>
  <img src="/assets/images/2025-11-08-local-llm-options/2025-10-09-22-05-23.png" alt="Tensor operations are paralellizable" />
  <figcaption><a href="https://rocm.blogs.amd.com/artificial-intelligence/tensor-parallelism/README.html">Tensor operations are paralellizable</a></figcaption>
</figure><br/>

The GPU itself doesn't know about tensors, though. It just knows how to operate with floating-point numbers with a lot of parallelism. So GPU manufacturers create software with different levels of abstraction to make it easier to run these pieces of hardware. For example, NVIDIA has [CUDA](https://developer.nvidia.com/cuda-toolkit), which lets you easily do math in parallel; [cuBLAS](https://developer.nvidia.com/cublas), which uses CUDA to expose an algebra-oriented API; and also [TensorRT](https://developer.nvidia.com/tensorrt), an SDK specialized in deep learning inference, which in turn uses cuBLAS.

# 2. The inference library

At the most basic level, an LLM model is an algorithm that takes some text and returns some other text. The model includes a layer, usually the first one, to convert the text into numbers. These numbers are then processed by the rest of the layers, and the result is converted to text. This whole process is called [inference](https://huggingface.co/blog/Kseniase/inference). All the billions of parameters we saw before are applied in different ways to the input data to generate the result. The inference library contains the code to execute all these operations.

Different options might have different levels of abstraction. For example, we mentioned TensorRT for general deep learning inference. But NVIDIA also provides [TensorRT-LLM](https://docs.nvidia.com/tensorrt-llm/index.html), designed for LLMs. Both options are available for NVIDIA GPUs only. Also, they are not just engines to generate tokens; they provide a lot more, as we'll see in the future.

Another popular option is [vLLM](https://docs.vllm.ai/en/latest/), a library-server with support for different hardware options.

<figure>
  <img src="/assets/images/2025-11-08-local-llm-options/2025-10-09-22-12-12.png" alt="A phone-calling llama" />
  <figcaption><a href="https://tvtropes.org/pmwiki/pmwiki.php/Advertising/LaLlamaQueLlama">The only llama I knew when I was young</a></figcaption>
</figure><br/>


And, of course, the most basic and known library, [llama.cpp](https://github.com/ggml-org/llama.cpp), which we'll use to start the tests in the next post.

# 3. The user interface

I haven't mentioned some of the most common tools associated with the "running LLMs on my PC" idea. The reason is that these options are just wrappers for accessing inference libraries conveniently. I'm focused now on understanding what is going on when running a local model, and trying to figure out what is the most performant option for me, so these tools are a distraction for that.

<figure>
  <img src="/assets/images/2025-11-08-local-llm-options/2025-10-09-22-13-33.png" alt="LM Studio looks cool" />
  <figcaption>LM Studio looks cool</figcaption>
</figure><br/>

But for the sake of completeness, a few mentions: [LM Studio](https://lmstudio.ai/) is a non-Open Source tool with a full-fledged UI to maximize convenience. [Open WebUI](https://openwebui.com/) is an open-source alternative to LM Studio, and so it is [Text Generation Web UI](https://openwebui.com/). One of the most popular options is [Ollama](https://ollama.com/), a command-line tool that simplifies the entire process of downloading, running, and interacting with the model.

Feel free to download and test any of these tools, but if you feel adventurous and want to compile your own LLM library, join me in the next chapter.
