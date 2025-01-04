---
layout: post
title: Training a model to play Connect-4 - II
subtitle: In which I explain how am I going to do it 
date: 2025-01-16
categories:
  - games
  - reinforcement learning
---
# The setup
I'll be using Python for everything (at least in principle) for several reasons:
- It is a very common language.
- I feel comfortable with it.
- It is the most common language for AI (although there is no need to implement the game in the same language as the training code).
- If we use LLMs to assist in coding, results will be better with Python than with any other language except perhaps JavaScript.


## Am I using LLMs to help with the coding?
Absolutely! I maintain that, when used properly, LLMs improve the productivity of most developers for most of the tasks. There are exceptions to every rule, but this project is not one of them.

I have a ChatGPT Plus subscription, and I commonly use Visual Studio Code as an IDE, which now includes a free-tier subscription for GitHub Copilot. This version lets you choose between GPT 4o and Claude 3.5 Sonnet. 

My preference is to use GPT 4o by default, with o1 as an option for discussions about complex algorithms. I know that Claude has been gaining traction for coding in recent months, but I haven't used it a lot. I also tried Gemini a few times with disappointing results, though I might give it another chance now that the new version seems to be available via [Google AI Studio](https://aistudio.google.com/).

Of course, these versions will be obsolete in a few months if the technology keeps advancing at the same pace.

You can use these models in a lot of different ways, but there are two different approaches that everybody should keep in mind:
- **The code assistant approach**: an extension of the IDE classical autocomplete capabilities, where the editor suggests pieces of code based on the name of the function, the comments, and other contextual information; I imagine this is the most common use.
- **The code buddy**: here, you talk with the model as if it were a dev coworker, not only to ask for code but for implementation ideas, code structure, code reviews, etc; this case doesn't require an IDE integration, just a chatbot like ChatGPT.

I use the code buddy approach all the time, and I only use inline IDE features to ask for information about pieces of code I'm unsure about.
# The learning
How am I planning to learn about Reinforcement Learning? My typical approach to learning something consists of reading or viewing a lot of different sources. Jumping from one source to the next helps me view things from different points of view until something clicks, and I finally "get it." This is what I've done to learn about Deep Learning in general and about Transformers and LLMs in particular. 

This approach is slow and not very hands-on. After reading [Build a Large Language Model (From Scratch)](https://livebook.manning.com/book/build-a-large-language-model-from-scratch), by [Sebastian Raschka](https://sebastianraschka.com/), I decided to change tactics and go for a totally different approach: build a model from scratch, getting only the minimal amount of information to advance the project at each step. So, at each moment, I will need to know:
- What to do next.
- How to do it in a very basic form.
Then, I will iterate to improve the results. Easy peasy!

# The steps
1. Build a program that plays Connect-4.
2. Play thousands of games to generate data to train a model.
3. Build a model.
4. Train the model.
5. Test the model.
6. Repeat the process.

Next step: build a Connect-4 game!