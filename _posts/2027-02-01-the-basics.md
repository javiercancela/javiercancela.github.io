---
layout: post
title: Reinforcement Learning II - Basic algorithms
subtitle: In which I take baby steps towards RL
date: 2027-02-01
tags:
  - reinforcement-learning
  - vibecoding
image: /assets/images/2026-02-02-connect-4/2026-01-25-18-29-24.png
---

With the basic engine [created]({% post_url 2026-01-25-connect-4 %}), the next step is adding a couple of basic non-RL agents.

# The heuristic agent

The first agent will follow a simple heuristic: make the most central move possible. For this, I wrote this prompt:

```
1.Add a new "heuristic" agent. The agent:
  - if it has a winning move, it plays it
  - if the opponent has one winning move, it blocks it
  - if a move gives the opponent a winning move, it avoids it
  - for the rest of the cases, it prioritices central moves, the more in the center the better
  - for ties, choose a random move
```

It implements it without a hitch. I test it against the random agent, playing the heuristic as the second player:


```bash
Running 1000 games: Random vs Heuristic

  100/1000 games completed
  200/1000 games completed
  300/1000 games completed
  400/1000 games completed
  500/1000 games completed
  600/1000 games completed
  700/1000 games completed
  800/1000 games completed
  900/1000 games completed
  1000/1000 games completed

========================================
Results
========================================

Random (Player 1):
  Wins:     13 (  1.3%)

Heuristic (Player 2):
  Wins:    987 ( 98.7%)

Draws:        0 (  0.0%)

Total:     1000 games
========================================
```

That simple rule makes all the different, and all of a sudden playing randomly is an almost sure defeat.

# The minimax agent

 Add a minimax agent to use as baseline for future Q-Learning agents (like the heuristic agent)
