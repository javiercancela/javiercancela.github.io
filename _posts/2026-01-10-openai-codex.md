---
layout: post
title: Vibe coding for senior software engineers
subtitle: In which I have to, once more, learn how to code
date: 2026-01-10
tags:
  - vibecoding
  - agents
image: /assets/images/2026-01-09-openai-codex/2026-01-09-20-41-59.png
---

All of a sudden, everybody is talking about how great vibe coding is. Well, what is actually surprising is that, this time, real experienced software engineers are talking about how GPT-5.2 and Claude 4.5 change the game.

I think it all began with [this tweet by Andrej Karpathy](https://x.com/karpathy/status/2004607146781278521):
<figure><img src='/assets/images/2026-01-09-openai-codex/2026-01-09-20-32-33.png' alt='If Andrej Karpathy is having an existential crisis, should I just retire?' /><figcaption>If Andrej Karpathy is having an existential crisis, should I just retire?</figcaption></figure><br/>

After that, some notable Software Engineer influencers (I think the term is accurate, but I can't make it sound serious in my mind when I read it) published messages giving vibe coding a positive spin, like [The Primeagen](https://x.com/ThePrimeagen/status/2008261459630059720?s=20), [The Pragmatic Engineer](https://open.substack.com/pub/pragmaticengineer/p/when-ai-writes-almost-all-code-what), or [Jaana Dogan](https://x.com/rakyll/status/2007239758158975130) (I don't know how well this last post was received inside the Gemini team).

I've been reading quite a lot about people using this new vibe approach to software engineering, and people's preferences seem to be split between GPT-5.2 and Claude 4.5, with only a few cases of people preferring Gemini. Among the most interesting reads I've found, there is [this thread](https://x.com/bcherny/status/2007179832300581177) from Claude Code creator Boris Cherny, or [this article by Peter Steinberger](https://steipete.me/posts/2025/shipping-at-inference-speed), which I found linked by Andrej Karpathy on Twitter.

# New tools for new engineering practices
Last year was the year of the AI IDEs and web tools, like [Cursor](https://cursor.com/), [Lovable](https://lovable.dev/), [v0](https://v0.app/), and others. But the focus now is on these command-line tools that emphasize the autonomy of the agents.

They are not apps where you are assisted by an LLM. Rather, they are interfaces through which you can communicate with a coding agent (or several). The difference is subtle but important: the user takes the seat of the ship's captain, while Codex or Claude takes the role of the rest of the officers on the ship's deck.
<figure><img src='/assets/images/2026-01-09-openai-codex/2026-01-10-11-59-26.png' alt='Claude vs Codex' /><figcaption>Claude vs Codex</figcaption></figure><br/>

So now I want to vibe-code a new project and write a blog post about the process. But while thinking about it, trying to locate some old Codex prompts, I realized there is no easy way (that I know of) to list all the Codex prompts in your system. You can use `codex resume` to show a list of Codex sessions in a given folder/repo, so you can select one and see its contents and keep working with the same context:
<figure><img src='/assets/images/2026-01-09-openai-codex/2026-01-10-12-38-28.png' alt='codex resume' /><figcaption>codex resume</figcaption></figure><br/>
but I didn't find a command to list all the sessions in your system, despite Codex storing all the session logs in the same folder by default (`$HOME/.codex/sessions`).

So I decided to make a quick vibe-coding test! I used Codex for the first version, Gemini to make a first refactor, Claude Code for final details and debugging. I spent about an hour doing it, mostly prompting specifics about paths, dealing with edge cases, etc. Well, actually, I spent most of the time waiting, because each task took a few minutes to complete. This is an important point: I tend to lose focus easily, and if I start browsing the web or reading articles while I wait, I don't realize that the agents have ended their tasks. This gave me two important lessons:
- Enable notifications from the agents! (obvious, but not trivial with my setup)
- Plan the work in parallel chunks: try to have several different agents working on different parts of the application, or on different applications.

<figure><img src='/assets/images/2026-01-09-openai-codex/2026-01-10-13-00-41.png' alt="Claude thinks I'm confused :-(" /><figcaption>Claude thinks I'm confused :-(</figcaption></figure><br/>

# The result
The resulting code is in [this repo](https://github.com/javiercancela/codex_logs). Not the most elegant piece of code ever, but it works.