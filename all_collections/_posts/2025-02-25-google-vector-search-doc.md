---
layout: post
title: Google Vector Search (lack of) documentation
subtitle: In which I find about region limitations
date: 2025-02-25
categories:
  - gcloud
  - embeddings
  - rants
---

One thing Google excels at is duplicating efforts: messaging apps, social apps, APIs, and even internal AI companies.

<figure><img src="/assets/images/2025-02-19-22-22-23.png" alt="We lost you too soon, Google Wave"/><figcaption><em>We lost you too soon, Google Wave</em></figcaption></figure><br/>

Google Brain and DeepMind merged into Google AI several years ago, but at times, it still seems as if separate companies are working in parallel.

# Vertex AI

Google launched [Vertex AI](https://cloud.google.com/vertex-ai) in 2021 to unify its services related to Machine Learning. This was before the GPT era, so offering AI to the public meant providing the infrastructure to train, deploy, and run classical ML models.

After OpenAI took advantage of Google's [Transformer architecture](<https://en.wikipedia.org/wiki/Transformer_(deep_learning_architecture)>) to release the first successful chatbot, Vertex AI evolved to become the platform for publishing, training, and fine-tuning LLM models, as well as providing APIs and SDKs to write code that makes use of these models.

The canonical example of the type of applications that LLMs enable is RAG applications.

<figure><img src="/assets/images/2025-02-19-22-38-27.png" alt="From Wikipedia"/><figcaption><em>From https://commons.wikimedia.org/wiki/File:RAG_schema.svg</em></figcaption></figure><br/>

# Searching vectors

The mentioned Transformer architecture uses an [encoder](https://en.wikipedia.org/wiki/Long_short-term_memory), a special type of neural network that turns text into numbers in such a way that semantic relationships are reflected in those numbers. In some way, the meaning of the text is present in the numbers, and we can measure the similarities with mathematical calculations.

Each text is transformed by the model into a fixed set of numbers, typically hundreds or thousands, which can be represented as a vector of hundreds or thousands of dimensions. The number of dimensions is the same regardless of the length of the text, altough the bigger the text, the more difficult it is to capture the "ideas" in it.

<figure><img src="/assets/images/2025-02-19-22-55-02.png" alt="ChatGPT's idea of an embedding"/><figcaption><em>ChatGPT's idea of an embedding</em></figcaption></figure><br/>

A RAG application works as follows: we gather the documents we want to search, split them into chunks (a tricky process for several reasons), generate embeddings for each chunk, and store them in a special type of database called a vector database. To answer a question for which there is an answer in the documentation, we create an embedding for the question, search the vector database using a specialized search method that returns results related to the question, and use an LLM to build an answer from the retrieved information. This is a simplified and naive approach to RAG, and typically, significant improvements are needed in various parts of the process, but you get the idea.

# Vector Search

Google [Vector Search](https://cloud.google.com/vertex-ai/docs/vector-search/overview) is one of Vertex AI's services.

TODO: Issues with creating an Index in us-east-1: can't properly index? It works in us-central-1, but different machines! Maybe is a matter of resources?
Also, can't index if index and bucket in different regions.
