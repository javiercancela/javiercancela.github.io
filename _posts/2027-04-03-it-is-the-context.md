---
layout: post
title: It's the context, stupid!
date: 2027-04-03
tags:
 - agents
---

# The context problem
LLMs store huge amounts of data in their weights. But this data is basically immutable: changing it requires re-training the model, and even just fine-tuning something like Qwen3.5 or Kimi K2.5 is beyond the capabilities of a personal computer.

There is another way to add information to LLMs: by including it in the prompt. Every time we ask a simple question to ChatGPT, Claud, or Gemini, the text these models receive is not just our question, but a lot of additional information about how they should answer based on our preferences, a few facts summarized from previous conversations (if conversation history is enabled), and, if the question is part of a conversation thread, all the previous questions ans answers.

We call all this information **context**, and it is the single most important thing to understand to make the best use of LLMs.

Every model has a context size, the amount of information that can fit as input for the model. Context size is measured in [tokens](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them), where a token is typically a word, a part of a word, a number, or a symbol. Modern commercial models have context sizes ranging from 200,000 to 2 million tokens. As a reference, a typical English text will have around 1,000 tokens per 750 words.

So, in principle, we could add up to 1.5 million words to the prompt and expect the model to use them as if they were part of its own knowledge. The problem is that the more context we feed the model, the less effective this information is. This problem is not too different from what happens to humans: if someone starts giving us instructions for minutes, we start forgetting and mixing things up. And so do LLMs. There is even a term for this issue: context rot.

So we want to keep context small, typically below half the model context size (this is just a rule of thumb; details vary with different models, types of context, etc.)

People have been trying to fight context rot since before the term was invented. The most common approach was called RAG (Retrieval-Augmented Generation). Instead of adding all available documentation to the context, a RAG system uses the initial user query to identify the relevant parts of the documentation to add to the context. The common way to retrieve relevant data is to embed the documentation piece by piece and then perform a vector search of the user query against this data (for example, using a vector database).

This approach has lost popularity in the last few months due to mixed results in real-world use cases and the increase in the context size of the new models.

# The context problem in coding
LLMs are really good at writing code. They are trained on lots of code, but they are also trained to come up with solutions to coding problems using techniques like RLVR. 

But code consumes more tokens than text, because code is composed by lots of symbols (commas, colons, equals, quotes, etc.), and each symbol is usually a token. An enterprise application with a few hundred files will need millions of tokens just for the code.

