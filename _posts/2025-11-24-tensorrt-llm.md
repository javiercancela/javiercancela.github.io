---
layout: post
title: Local LLMs IV - Installing and running TensorRT-LLM
subtitle: In which I try to go the NVIDIA way
date: 2025-11-24
tags:
  - local-llm
  - tensorrt-llm
---


As mentioned in the [previous post]({% post_url 2025-10-22-reinstalling-ubuntu %}), I tried TensorRT-LLM to do the same as with Llama.cpp. I can't say I enjoyed the process.

# Getting TensorRT-LLM

I followed the instructions from the [installation page](https://nvidia.github.io/TensorRT-LLM/installation/build-from-source-linux.html). Specifically, I chose [option 2](https://nvidia.github.io/TensorRT-LLM/installation/build-from-source-linux.html#option-2-container-for-building-tensorrt-llm-step-by-step), building TensorRT inside a container.

You can also download an existing image from the [NVIDIA Docker hub](https://hub.docker.com/r/nvidia/cuda/tags), and just run it with
```bash
docker run -it --rm --gpus all nvidia/cuda:13.0.2-cudnn-devel-ubuntu24.04
```
but I want to do as much manual work as possible.

The plan is to download the TensorRT-LLM repo, install the needed packages to run Docker using the NVIDIA runtime, and then build TensorRT-LLM inside the container. The instructions for this are:

```bash
# TensorRT LLM uses git-lfs, which needs to be installed in advance.
apt-get update && apt-get -y install git git-lfs
git lfs install

git clone https://github.com/NVIDIA/TensorRT-LLM.git
cd TensorRT-LLM
git submodule update --init --recursive
git lfs pull
```
where `git lfs` is an extension to manage large files in git.

But before building and running the container, you have to make sure the NVIDIA container toolkit is installed, and docker will use it. For that, we run this:
```bash
# Install the toolkit and configure Docker to use the NVIDIA runtime
sudo apt-get install -y nvidia-container-toolkit
sudo nvidia-ctk runtime configure --runtime=docker
# Restart Docker to apply the changes
sudo systemctl restart docker
```

# Building the image

Inside the TensorRT-LLM folder, we run
```bash
make -C docker build
```
which is a wrapper around

```bash
docker build --pull \
 --target devel \
 --file docker/Dockerfile.multi \
 --tag tensorrt_llm/devel:latest \
 .
```

On my computer, this takes 40 minutes. Once finished, we run
```bash
make -C docker run
```
and get into the container.

# Compiling TensorRT-LLM

I won't detail here a lot of failed attempts to use a virtual environment and get rid of all the version incompatibilities in the code. I ended up starting from scratch and just doing
```bash
python3 ./scripts/build_wheel.py --cuda_architectures "120-real"
```
The CUDA architecture depends on the specific GPU model. My RTX 5060 Ti has a [compute capability](https://developer.nvidia.com/cuda-gpus) of 12.0, so the architecture is "120-real" (I haven't seen this heuristic of "remove the dot and append -real" anywhere, but it seems to work).

The `build_wheel.py` script creates an [installable Python package](https://realpython.com/python-wheels/) with all the TensorRT-LLM components and the needed libraries. The package will be a file like `build/tensorrt_llm-1.2.0rc2-cp312-cp312-linux_x86_64.whl`, where the params depend on the TensorRT-LLM version, CPython version, and operating system.

We then install it (asterisk for lazy people):
```bash
pip install ./build/tensorrt_llm*.whl
```
and once it finishes (it shouldn't take too long), we test the installation with something like
```bash
python -c "import tensorrt_llm; print(tensorrt_llm.version)"
```

As a reference, I got this exit from the test:
```bash
python -c "import tensorrt_llm; print(tensorrt_llm.version)"
/usr/local/lib/python3.12/dist-packages/torch/cuda/__init__.py:63: FutureWarning: The pynvml package is deprecated. Please install nvidia-ml-py instead. If you did not install pynvml directly, please report this to the maintainers of the package that installed pynvml for you.
 import pynvml  # type: ignore[import]
/usr/local/lib/python3.12/dist-packages/modelopt/torch/utils/import_utils.py:32: UserWarning: Failed to import huggingface plugin due to: AttributeError("module 'transformers.modeling_utils' has no attribute 'Conv1D'"). You may ignore this warning if you do not need this plugin.
 warnings.warn(
/usr/local/lib/python3.12/dist-packages/modelopt/torch/__init__.py:36: UserWarning: transformers version 4.56.0 is incompatible with nvidia-modelopt and may cause issues. Please install recommended version with `pip install nvidia-modelopt[hf]` if working with HF models.
 _warnings.warn(
[TensorRT-LLM] TensorRT LLM version: 1.2.0rc2
<module 'tensorrt_llm.version' from '/code/tensorrt_llm/tensorrt_llm/version.py'>
```
I gave up on trying to get rid of the warnings. The key part is `[TensorRT-LLM] TensorRT LLM version: 1.2.0rc2` where we see that TensorRT-LLM works.

# Running a model

With the help of ChatGPT 5.1, I added this Python script to the container (code comments are from ChatGPT):
```python
from tensorrt_llm import LLM, SamplingParams


def main():
    # Local path or HF repo id
 model_path = "nvidia/Qwen3-8B-FP8"

 llm = LLM(
        model=model_path,
        dtype="float16",          # FP16 on your 5060 Ti
        tensor_parallel_size=1,   # single GPU
        max_batch_size=1,
        max_input_len=2048,
        max_seq_len=9192,         # <-- this is the total context length
        # NOTE: no max_output_len here
    )

 sampling = SamplingParams(
        temperature=0.7,
        top_p=0.9,
        max_tokens=9192,            # <-- this is the output length control
    )

 prompts = [
        "A man is looking at a picture of someone. His friend asks who it is. The man replies, \ "Brothers and sisters, I have none. But that person's father is my father's son.\" Who is in the picture?"
    ]

 outputs = llm.generate(prompts, sampling_params=sampling)

    for i, out in enumerate(outputs):
        print(f"\n=== Prompt {i} ===")
        print("Prompt:", prompts[i])
        print("Output:", out.outputs[0].text)


if __name__ == "__main__":
    main()
```

The goal was to use the same model as with the Llama.cpp test. But I don't think there is an easy way to use the GGUF model format in TensorRT-LLM. So I went with the same model with the same quantization from Nvidia. But the format is different, and important details (like the chat template) might be different too. You can find the results in [this file](/assets/files/tensorrt-answer.txt).

Summary: the reasoning is ok, but it enters an almost infinite loop of second-guessing itself. Most of the time it correctly comes to the conclusion that the answer is the son or the daughter, but immediately after it gets confused by the son in "But that person's father is my father's son".

I don't know if this difference in behavior is due to differences in the code params or in the model itself.

# Benchmarking the model

TensorRT-LLM includes a tool called `trtllm-bench` that can be used to benchmark the model. The documentation can be found [here](https://nvidia.github.io/TensorRT-LLM/commands/trtllm-bench.html#trtllm-bench).

We first need to prepare the dataset:
```bash
python benchmarks/cpp/prepare_dataset.py \
 --stdout \
 --tokenizer nvidia/Qwen3-8B-FP8 \
 token-norm-dist \
 --input-mean 1024 \
 --output-mean 128 \
 --input-stdev 0 \
 --output-stdev 0 \
 --num-requests 512 \
 > ./qwen3_1024_128_512.txt
```

Once the dataset is created, we run the benchmark:
```bash
trtllm-bench \
 --model nvidia/Qwen3-8B-FP8  \
 latency  \
 --dataset ./qwen3_1024_128_512.txt  \
 --tp 1    \
 --pp 1  \
 --ep 1 \
 --max_seq_len 1152 \
 --num_requests 1 \
 --concurrency 1 \
 --warmup 0 \
 --kv_cache_free_gpu_mem_fraction 0.9 \
 --report_json qwen3_8b_fp8_latency_b1_1024_128.json
```

The results are in [this file](/assets/files/qwen3_8b_fp8_latency_b1_1024_128.json).

Since I designed the test with ChatGPT's help, I asked it for its opinion on the test and how it compares with the test I ran with Llama.cpp. Its answer ends this way:

> Conclusion: On your RTX 5060 Ti, for single-user local inference, TensorRT-LLM doesn't give you a real speed advantage over llama.cpp. Its value is when you start increasing concurrency / batch size.

# Final thoughts

I didn't enjoy working with TensorRT-LLM. I imagine it is a great option for production environments, but it isn't worth all the work for just trying models as a learner.