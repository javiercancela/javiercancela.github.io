1. Game
- puzzle and detective: a fixed small location, a few characters, the player has the goal to solve a mystery by talking to the characters and interacting with the environment
- single-player
- handcrafted story
- some LLM improvisation, especially to test the models
2. Scope
- A story with one character that knows something the player needs to know because it allows a simple puzzle to be solved so the player can exit the location: an agent for the character, an agent to decide if the player wants to interact with the environment or with the player
- weekend prototype
3. Tech stack
- Python
- cli only
- llama.cpp
- custom orchestration
4. Agent architecture
- at least three agents, more if really needed
- agents should run sequentially
- what you think guarantees better results
5. Models to evaluate
- I was thinking about the latest Qwen models, but let me know if you think there are better options
- The versions of GPT and Claude with a better price/performance relationship for this task
- The main goal is making the player interactions logic and consistent, so whatever models are best suited for this
6. Evaluation
- I want to measure for the game, in this order: coherence, narrative consistency, fun
- I will only measure the agents for price, and for its ability to give the game coherence and narrative consistency
- No need, I'll test by playing and taking notes
7. Constraints
- Yes, fully local
- No
- Yes, 64GB RAM and 16GB VRAM
- Yes
8. Code quality /delivery
- No prod-style repo needed, just some docs
- Optimize for architectural cleanliness
9. Game content generation
- Write a first very simple version of the world and story for v1, I'll write them manually in future versions
10. A project plan for me
