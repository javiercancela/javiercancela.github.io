---
layout: post
title: Writing an agentic conversational game - I
subtitle: In which I use agents to write an agent-based game
date: 2026-03-12
tags:
 - vibecoding
 - agents
image: /assets/images/2027-01-01-llm-rpg/2026-03-08-22-48-55.png
---

# The idea

My first computer was a Sinclair ZX81, but after only a few months, my father sold it and bought a ZX Spectrum. Thanks to the Spectrum, I learnt to code, but most of the time I spent with this computer, and this was a good part of my childhood, I was playing games.

And one of my favourite types of games was conversational games.
<figure><img src='/assets/images/2027-01-01-llm-rpg/2026-03-08-22-56-26.png' alt='TODO' /><figcaption>I liked the book more than the movies. And the game more than the book.</figcaption></figure><br/>

So why not try to recreate games like this one, but with LLMs to have actual conversations? How hard can it be? (Famous last words). Let's find out!

# The plan

My go-to model is GPT. At the moment of starting this project, GPT 5.4 was already announced but not yet released, so I used GPT 5.3 (web interface).

This is the initial prompt:
<figure><img src='/assets/images/2027-01-01-llm-rpg/2026-03-12-16-51-33.png' alt='A reasonable request' /><figcaption>A reasonable request</figcaption></figure><br/>
And this is the answer:
<figure><img src='/assets/images/2027-01-01-llm-rpg/2026-03-12-16-53-44.png' alt='Ha! Not that fast!' /><figcaption>Ha! Not that fast!</figcaption></figure><br/>
Ok then, let's clarify things first:
<figure><img src='/assets/images/2027-01-01-llm-rpg/2026-03-12-16-55-06.png' alt='Here you go!' /><figcaption>Here you go!</figcaption></figure><br/>
And finally:
<figure><img src='/assets/images/2027-01-01-llm-rpg/2026-03-12-17-04-30.png' alt='Finally!' /><figcaption>Finally!</figcaption></figure><br/>

[The plan](/assets/files/03-project_plan_detective_llm_agents.md) is quite comprehensive.

# The review

But is it a good plan? Let's ask Claude! I fed Claude Opus 4.6 the original prompt, the questions from ChatGPT, my answers, and the plan. This was Claude's answer:
<figure><img src='/assets/images/2027-01-01-llm-rpg/2026-03-12-17-28-44.png' alt='Not bad' /><figcaption>Not bad</figcaption></figure><br/>

I was interested in knowing more about the model recommendations:
<figure><img src='/assets/images/2027-01-01-llm-rpg/2026-03-12-17-29-50.png' alt='My specs suck' /><figcaption>My specs suck</figcaption></figure><br/>
I have an NVIDIA GeForce RTX 5060 Ti with an AMD Ryzen 9 7900 × 24 and 64 GB of RAM running on Ubuntu 24.04. This was his (its?) recommendation:
<figure><img src='/assets/images/2027-01-01-llm-rpg/2026-03-12-17-34-23.png' alt='Outdated' /><figcaption>Outdated</figcaption></figure><br/>
A problem with conversations like this one is that the model finds a recent result (Qwen-3) but doesn't bother to check if there is a better option that wasn't available when the model was trained, as is the case with Qwen-3.5, which was announced in mid February. (To be fair, this happens less with ChatGPT). I have to ask Claude to double-check:
<figure><img src='/assets/images/2027-01-01-llm-rpg/2026-03-12-17-40-50.png' alt='Are you sure?!' /><figcaption>Are you sure?!</figcaption></figure><br/>
After that, he did a web search to get all the data:
<figure><img src='/assets/images/2027-01-01-llm-rpg/2026-03-12-17-42-16.png' alt='Claude thinks he is talking to Trump' /><figcaption>Claude thinks he is talking to Trump</figcaption></figure><br/>
I find it interesting that he uses this sycophantic tone to recognize the mistake.

We are now ready to start the coding phase.

