---
layout: post
title: Reinstalling Ubuntu
subtitle: In which I go down from Ubuntu 25.04 to Ubuntu 24.04
date: 2025-10-22
tags:
  - my-pc
image: /assets/images/2025-10-12-blog-redesign-codex/2025-11-25-22-16-21.png
---

# I made a mistake
To be honest, I knew I was taking a risk going with Ubuntu 25.04. For example, Nvidia lists only Ubuntu 24.04 and 22.04 (the LTS versions still with standard support) for installing [the CUDA Toolkit](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/).

But I thought, "I'm sure it won't matter, and 25.04 is so bright and shiny!" At least I didn't go with 25.10.

I had small issues from the beginning, with the computer freezing sometimes after coming back from sleep mode. But everything went south while trying to compile [TensorRT-LLM](https://github.com/NVIDIA/TensorRT-LLM). I tried compiling the code directly on the computer, not in a container, and I started finding all types of issues that, unfortunately, I didn't document.

# Ubuntu 24.04, here we come
I've been running 24.04 for just a few days, but it feels more stable. No freezes, no driver conflicts. But I won't try compiling TensorRT-LLM directly again. This time, I'm going with the safer option of compiling inside a container, since it is what Nvidia recommends. So I hope no more problems with the drivers!

