---
layout: post
title: Training a model to play Connect-4 - IV
subtitle: In which I get some data
date: 2025-02-13
categories:
  - games
  - reinforcement learning
---
# The simulator
We need to run lots of games to train the model. We will start by playing random games.
```python
import random
from game_engine.game import Game


class Simulator:
  def __init__(self):
    self.all_states = []
    self.games = []

  def play_game(self):
    game = Game()
    while game.get_winner() is None:
      valid_moves = game.get_valid_moves()
      move = random.choice(valid_moves)
      game.make_move(move)

    result = game.get_winner() if game.get_winner() != 2 else -1
    self.games.append(result)
    for state, move in zip(*game.get_game_states_and_moves()):
      self.all_states.append((state, move, result))

```
The simulator has a method to play a game that takes a random valid move and plays it. We store the result of the game with a change: 