---
layout: post
title: What is Reinforcement Learning
subtitle: In which we learn how to learn
date: 2025-04-25
categories:
  - games
  - reinforcement learning
---

# The minimum we need to know

There are lots of resources about Reinforcement Learning out there, so I won't try to make any type of introduction here. 

Also, at this point, just asking Gemini or ChatGPT is a great option. Let's try that, with GPT 4.5, [before it gets removed](https://community.openai.com/t/gpt-4-5-preview-model-will-be-removed-from-the-api-on-2025-07-14/1230050).



<figure><img src="/assets/images/2025-04-22-22-17-34.png" alt=""/><figcaption><em>Write a one-page summary of Reinforcement Learning and how it works. Make it simple for an audience with a technical background but no experience in Machine Learning.
</em></figcaption></figure><br/>

Not bad! But let's focus on just the basics, so we can move on with the Connect-4 model.

# Connect 4 and Reinforcement Learning

<figure><img src="/assets/images/2025-04-25-19-20-11.png" alt=""/><figcaption><em>Gemini's idea of using RL to train a Connect 4 model</em></figcaption></figure><br/>

In the [Connect 4 project](2025-01-04-training-connect-4-i) we are training a model. This model will be the **agent**. The **environment** is the Connect 4 board. The agent modifies the environment using **actions**, that is, dropping a piece in a non-full column. That changes the **state** of the environment. After each move, and when the game finishes, the agent gets a reward.

<figure><img src="/assets/images/2025-04-25-19-24-36.png" alt=""/><figcaption><em>ChatGPT's version is certainly different</em></figcaption></figure><br/>

Most of this is pretty straightforward, but the reward part is tricky. How do we decide what reward to give? How can we give a reward after a move if there is no winning or losing yet. We'll analyze that in the next articles.