---
layout: post
title: Training a model to play Connect-4 - I
subtitle: In which I explain what is this about
date: 2025-01-04
categories:
  - games
  - reinforcement learning
---

# Why Oh Why

I have a clear memory of several times when AI made an impression on me. The first was when I learned about [gradient descent](https://en.wikipedia.org/wiki/Gradient_descent) back in college (in a class I basically never attended, like most of my classes — the fact that I still got a degree is a clear sign my university failed.) In the last few years, generative AI has appeared as an almost magical technology (most people focus on the failures and unfulfilled hype, but I can’t help but recall how these advancements seemed impossible just a few years ago.) But the one that really resonates with me is AlphaZero (I knew about AlphaGo, but I don’t think I paid much attention to it)

Back in college, while I was skipping classes and exams, I spent a lot of time playing cards. Mostly typical Spanish games like [Tute](https://en.wikipedia.org/wiki/Tute) or [Mus](<https://en.wikipedia.org/wiki/Mus_(card_game)>), usually with no serious bets — just the loser paying for the beers. I didn’t really understand gradient descent back then, but I had the idea of training a program to play cards. It sounded so cool!


<figure>
  <img src="https://img.lavdg.com/sc/B42xvwgBqywzTuRRMKSeEYRBjJA=/768x/2024/02/29/00121709211271699981205/Foto/IMG_20240229_135143.jpg" alt="My typical college studying setup"/>
  <figcaption>My typical college studying setup (<a href="https://www.lavozdegalicia.es/noticia/santiago/vivir-santiago/2024/02/29/universitarios-santiago-rescatan-baraja-cartas-baul-abuela-torneos-tute-premio-botella-licor-cafe/00031709208794089273362.htm">source</a>)</figcaption>
</figure><br/>


I never got to it, partly because I didn’t know how to start, partly because it was the 90s, and the technology wasn’t there yet. But the idea of training a model to play a game stuck with me, and the success of AlphaZero pushed me to start reading about Machine Learning and Deep Learning (slightly) before it was trendy.

All this is to say I really wanted to start a project like this: training a model to play a game. Now the technology is definitely there, there are lots of internet communities dedicated to this, and for doing something simple, you just need your personal computer.

# The project

Connect-4 is a [solved game](https://mathworld.wolfram.com/Connect-Four.html). With perfect play, the first player always wins. It is a simple game in which two players drop colored disks in a vertical 7-column, 6-row grid.
<figure>
  <img src="https://upload.wikimedia.org/wikipedia/commons/a/ad/Connect_Four.gif" alt="Connect-4 board"/>
  <figcaption>Image source: <a href="https://commons.wikimedia.org/wiki/File:Connect_Four.gif">Wikipedia</a></figcaption>
</figure><br/>

It is also a game with [7.5 trillion possible states](https://math.stackexchange.com/questions/301106/how-many-different-game-situations-has-connect-four?newreg=59bd75e52386420095d2a94e32181dd4). So, it should be complex enough to require some work to find the right approach. What I don't know (yet) is whether it will be too challenging for a learning experiment on a personal computer. We'll see.

I am using this project to learn about [Reinforcement Learning](https://en.wikipedia.org/wiki/Reinforcement_learning), probably starting with [Deep Q-learning](https://en.wikipedia.org/wiki/Q-learning#Deep_Q-learning), but I still don't know if that is the right approach. The exciting part is that there will be many other things to learn along the way.

I will be uploading the code to [this repo](https://github.com/javiercancela/connect-4).
