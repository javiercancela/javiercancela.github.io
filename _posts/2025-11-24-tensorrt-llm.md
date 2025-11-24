---
layout: post
title: Local LLMs IV - Installing and running TensorRT-LLM
subtitle: In which I try go the NVIDIA way
date: 2025-11-24
tags:
  - local-llm
  - tensorrt-llm
---


As mentioned in the [previous post]({% post_url 2025-10-22-reinstalling-ubuntu %}), I'm tried TensorRT-LLM to do the same as with llama.cpp. I can't say I enjoyed the process.

# Getting TensorRT-LLM

I followed the instructions from the [installation page](https://nvidia.github.io/TensorRT-LLM/installation/build-from-source-linux.html). Specifically, I chose [option 2](https://nvidia.github.io/TensorRT-LLM/installation/build-from-source-linux.html#option-2-container-for-building-tensorrt-llm-step-by-step),building TenserRT inside a container.

You can also download an existing image from the [NVIDIA Docker hub](https://hub.docker.com/r/nvidia/cuda/tags), and just run it with
```
docker run -it --rm --gpus all nvidia/cuda:13.0.2-cudnn-devel-ubuntu24.04
```
but I want to do as much manual work as possible.

The plan is to download the TensorRT-LLM repo, install the needed packages to run docker using the NVIDIA runtime, and then build TensorRT-LLM inside the container. The instructions for this are:

```
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
```
# Install the toolkit and configure Docker to use the NVIDIA runtime
sudo apt-get install -y nvidia-container-toolkit
sudo nvidia-ctk runtime configure --runtime=docker
# Restart Docker to apply the changes
sudo systemctl restart docker
```

# Building the image

Inside the TensorRT-LLM folder, we run
```
make -C docker build
```
which is a wrapper around

```
docker build --pull \
  --target devel \
  --file docker/Dockerfile.multi \
  --tag tensorrt_llm/devel:latest \
  .
```

In my computer this takes 40 minutes. Once finished, we run
```
make -C docker run
```
and get into the container.

# Compiling TensorRT-LLM

I won't detail here a lot of failed attempts to use a virtual environment and get rid of all the version incompatibilities in the code. I ended up starting from scratch and just doing
```
python3 ./scripts/build_wheel.py --cuda_architectures "120-real"
```
The CUDA architecture depends on the specific GPU model. My RTX 5060 Ti has a [compute capability](https://developer.nvidia.com/cuda-gpus) of 12.0, so the architecture is "120-real" (I haven't seen this heuristic of "remove the dot and append -real" anywhere, but it seems to work).

The `build_wheel.py` script creates an [installable Python package](https://realpython.com/python-wheels/) with all the TensorRT-LLM components and the needed libraries. The package will be a file like `build/tensorrt_llm-1.2.0rc2-cp312-cp312-linux_x86_64.whl`, where the params depend on the TensorRT-LLM version, CPython version, and operative system.

We then install it (asterisk for lazy people):
```
pip install ./build/tensorrt_llm*.whl
```
and once it finishes (it shouldn't take too long) we test the installation with something like
```
python -c "import tensorrt_llm; print(tensorrt_llm.version)"
```

As a reference, I get this exit from the test:
```
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

With the help of ChatGTP 5.1, I added this Python script to the container:
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
        "A man is looking at a picture of someone. His friend asks who it is. The man replies, \"Brothers and sisters, I have none. But that person's father is my father's son.\" Who is in the picture?"
    ]

    outputs = llm.generate(prompts, sampling_params=sampling)

    for i, out in enumerate(outputs):
        print(f"\n=== Prompt {i} ===")
        print("Prompt:", prompts[i])
        print("Output:", out.outputs[0].text)


if __name__ == "__main__":
    main()
```
The goal was to use the same model as with the Llama.cpp test. But I didn't think there is an easy way to use the GGUF model format in TensorRT-LLM. So I went with the same model with the same quantization from Nvidia. But the format is different, and important details (like the chat template) might be different too.



# save_engine.py
from tensorrt_llm import LLM

def main():
    engine_dir = "/models/qwen3_fp8_engine"
    print("Building engine… this may take a while")

    llm = LLM(
        model="nvidia/Qwen3-8B-FP8",
        tensor_parallel_size=1,
        max_batch_size=1,
        max_input_len=2048,
        max_seq_len=3072,
        dtype="float16",
    )

    print("Saving engine to:", engine_dir)
    llm.save(engine_dir)
    print("Done.")

if __name__ == "__main__":
    main()

# No save method in https://nvidia.github.io/TensorRT-LLM/latest/index.html

cd /code/tensorrt_llm
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


trtllm-bench \
  --model nvidia/Qwen3-8B-FP8 \
  throughput \
  --dataset ./qwen3_1024_128_512.txt \
  --engine_dir /models/qwen3_fp8_engine \
  --num-requests 512 \
  --report_path ./qwen3_fp4_report.json


# Different approach
# Download using huggingface-cli
huggingface-cli download nvidia/Qwen3-8B-FP8 --local-dir ./qwen_fp8_ckpt

python3 examples/models/core/qwen/convert_checkpoint.py \
    --model_dir ./qwen_fp8_ckpt \
    --output_dir ./qwen_fp8_tllm_checkpoint \
    --dtype float16

# Build and save the engine to disk
trtllm-build \
    --checkpoint_dir ./qwen_fp8_tllm_checkpoint \
    --output_dir ./qwen_fp8_engine \
    --gemm_plugin float16 \
    --max_batch_size 128

# Memory error, let's try
trtllm-build \
    --checkpoint_dir ./qwen_fp8_tllm_checkpoint \
    --output_dir ./qwen_fp8_engine \
    --gemm_plugin float16 \
    --max_batch_size 8 \
    --max_seq_len 2048 \
    --max_num_tokens 8192

trtllm-build \
  --checkpoint_dir ./qwen_fp8_tllm_checkpoint \
  --output_dir ./qwen_fp8_engine \
  --gemm_plugin disable \
  --max_batch_size 1 \
  --max_seq_len 2048 \
  --max_num_tokens 2048 \
  --workers 1
