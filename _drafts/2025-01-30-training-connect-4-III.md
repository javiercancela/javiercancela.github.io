---
layout: post
title: Training a model to play Connect-4 - III
subtitle: In which I code a game 
date: 2025-01-30
categories:
  - games
  - reinforcement learning
---
# The board
A Conect-4 board is a grid of 7 columns and 6 rows. 

```python
import numpy as np

class Board:

	def __init__(self):
		self.board = np.zeros((6, 7), dtype=int)

	def __str__(self):
		return '\n'.join([' '.join([str(cell) for cell in row]) for row in reversed(self.board)])
```

We create a 6x7 matrix with numpy and we also add the ability to print the board as text in the console.

```python
import numpy as np

class Board:
...
	def make_move(self, player, column):
		row = self._get_next_available_row(column)
		if row is None:
			self.board[row][column] = player
			
		return row

	def _get_next_available_row(self, column):
		for row in range(ROWS):
			if self.board[row][column] == EMPTY_VALUE:
				return row
		return None
```

Making a move consists of selecting a column and dropping a piece in it. The method `get_next_available_row` returns the first empty row in the column, and we use it to put the piece (a number identifying the player) in that position of the board. We return the row, that will be `None` if the column was full before the move.

### Checking for a win
There is not a lot of logic for the board. We have to check that there is free space in the column, which the `make_move` method already does, and we have to check if there is a winning position. 

I tried several options for this last check, but in the end I asked ChatGPT for a simple algorithm for this. This is what it proposed. First, we define an array of directions:

```python
DIRECTIONS = [
	(1, 0), # vertical
	(0, 1), # horizontal
	(1, 1), # diagonal down-right
	(1, -1), # diagonal down-left
	]
```
Then we define this method inside `Board`:
```python
def check_win(self, player, played_row, played_column):

	def is_position_in_board(r, c):
		return 0 <= r < 6 and 0 <= c < 7

	for d_row, d_col in DIRECTIONS:
		count = 1 # Count the current piece

		# We move along one of the directions
		row, column = played_row + d_row, played_column + d_col
		while is_position_in_board(row, column) and self.board[row][column] == player:
			count += 1
			row += d_row
			column += d_col
	
		# We move along the opposite direction
		row, column = played_row - d_row, played_column - d_col
		while is_position_in_board(row, column) and self.board[row][column] == player:
			count += 1
			row -= d_row
			column -= d_col
	
		if count >= 4:
			return True

	return False
```
This is the exact code ChatGPT generated with a few variable name changes. I was tempting of refactoring the duplicated code that goes through the pieces in one direction and then in the other one, but this is one good example of how the DRY principle should be frequently ignored: the code is easier to read this way.

Is the code a direct copy from some project in GitHub? There are several public repositories with code that could be the source for Copilot, but they are all recent, so I don't think they are the original source. I do think that Copilot had this exact problem in its training data, so there must be some project somewhere with this exact algorithm and we are just copying it.

# The game interface
The board is just a tool to play the game, so we need a new entity to represent the game. 
```python
from game_engine.board import Board

PLAYER_ONE = 1
PLAYER_TWO = 2


class Game:
    def __init__(self):
        self.player_turn = PLAYER_ONE
        self.board = Board()
        self.winner = None
        self.states = []
        self.moves = []

    def get_turn(self):
        return self.player_turn

    def make_move(self, column):
        row = self.board.make_move(self.player_turn, column)
        is_valid_move = row is not None
        if is_valid_move:
            self.states.append(self.board.get_board_state())
            self.moves.append(column)
            self._check_game_status(row, column)
            self._switch_turn()

        return is_valid_move

    def get_winner(self):
        return self.winner

    def print_board(self):
        print(self.board)

    def get_valid_moves(self):
        return self.board.get_valid_moves()

    def get_game_states_and_moves(self):
        return self.states, self.moves

    def _switch_turn(self):
        self.player_turn = PLAYER_ONE if self.player_turn == PLAYER_TWO else PLAYER_TWO

    def _check_game_status(self, row, column):
        if self.board.check_win(self.player_turn, row, column):
            self.winner = self.player_turn
        elif self.board.is_full():
            self.winner = 0
```

Not a lot of complexity here: the game has a board, a player that has to play, a winner set initially to `None`, and arrays to store states and moves, which will be useful in the future. The two players are represented by the numbers 1 and 2, and we switch players after a successful move. The game ends with a winner, or with a draw (represented by a 0) when the board is full.

### Testing the game
We can play a quick game with the following code:

```python
from game_engine.game import Game


game = Game()

while True:
  move = input(f"Player {game.get_turn()} (or 'quit' to exit): ")
  if move.lower() == 'quit':
    break
  try:
    column = int(move)
    if not 0 <= int(column) <= 6:
      print("Invalid move. Please enter a column number between 0 and 6.")
      continue
    game.make_move(column)
    game.print_board()
    if game.get_winner() is not None:
      if game.get_winner() == 'Tie':
        print("It's a tie!")
      else: 
        print(f"Player {game.get_winner()} wins!")
      break
  except ValueError:
    print("Invalid input. Please enter a column number between 0 and 6.")
```

We get something like this:
<figure>
  <img src="/assets/images/202501/testgame.png" alt="A Connect-4 game"/>
  <figcaption><em>I won!!!</em></figcaption>
</figure><br/>


### Full code
[board.py](https://github.com/javiercancela/connect-4/blob/main/game_engine/board.py)

[game.py](https://github.com/javiercancela/connect-4/blob/main/game_engine/game.py)

[play_game.py](https://github.com/javiercancela/connect-4/blob/main/play_game.py)
