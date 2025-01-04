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
I'm using Python for several reasons:
- it is a very common language
- it is the most common language for AI (although there is no need to implement the game in the same language as the training code)
- if we use LLMs to assist in coding, results will be better with Python than with any other language except maybe JavaScript


## Am I using LLMs to help with the coding?
Absolutely! I would argue that, when used properly, LLMs improve the productivity of most developers for most of the tasks. There are exceptions for everything, but this project is not one of them.

I have a ChatGPT Plus subscription, and I commonly use Visual Studio Code as an IDE, which now includes a free tier subscription for GitHub Copilot. This version lets you choose between GPT 4o and Claude 3.5 Sonnet. 

My preference is using GPT 4o by default, with o1 as an option for discussions about complex algorithms. I know that Claude has been gaining a lot of traction for coding  in the last few months, but I haven't personally used it a lot.  I also tried Gemini a few times with disappointing results, but I might give it another chance now that the new version seems to be available via [Google AI Studio](https://aistudio.google.com/).

Of course, these versions will be obsolete in a few months if the technology keeps advancing at the same pace.

You can use this model in a lot of different ways, but there are two different approaches that everybody should keep in mind:
- **the code assistant approach**: this is an extension of the IDE classical autocomplete capabilities, where the editor suggests pieces of code based on the name of the function, the comments, and other contextual information; I imagine this is the most common use
- **the code buddy**: here, you talk with the model as if it were a dev coworker, not only to ask for code but for implementation ideas, code structure, code reviews, etc; this case doesn't require an IDE integration, just a chatbot like ChatGPT

I use the code buddy approach a lot, and I only use inline IDE features to ask for information about pieces of code I'm unsure about.
# The learning
How am I planning to learn about Reinforcement Learning? My typical approach to learning something consists of reading or viewing a lot of different sources. Jumping from one source to the next helps me view things from different points of view until something makes click, and I finally "get it." 
