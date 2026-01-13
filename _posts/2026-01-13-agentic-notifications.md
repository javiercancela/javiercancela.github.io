---
layout: post
title: Adding Codex and Claude Code notifications to Alacritty
subtitle: In which I try to know what the agents are up to
date: 2026-01-13
tags:
  - vibecoding
  - agents
image: /assets/images/2026-01-12-agentic-notifications/2026-01-13-09-32-44.png
---

I mentioned [before](post_url 2026-01-10-vibe-coding) that getting notifications wasn't that easy, at least in my setup. This causes me to get lost in ~~Twitter~~ and other important work while the agents are waiting for me.

# Claude Code

For Claude Code, the fix is not that hard. We can configure `hooks`, so when some predefined event happens, you can run a script. In our case, since we want a notification, we'll use the `notify-send` Linux program:
```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "notify-send -u critical 'Claude Code' 'Task finished'"
          }
        ]
      }
    ],
    "Notification": [
      {
        "matcher": "permission_prompt|idle_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "notify-send -u critical 'Claude Code' 'Needs your input'"
          }
        ]
      }
    ]
  }
}

```

We listen for the `Stop`and `Notification` events, and we can filter what notifications. The documentation is [here](https://code.claude.com/docs/en/hooks#hook-events). I use the parameter `-u critical` to tell the system to keep the notification; without it, the notification disappears in a couple of seconds.
<figure><img src='/assets/images/2026-01-13-agentic-notifications/2026-01-13-22-20-10.png' alt="I'm done! Please tell me what to do!" /><figcaption>I'm done! Please tell me what to do!</figcaption></figure><br/>

# OpenAI Codex

I haven't found a direct solution for Codex. There isn't (at the time of this post) a mechanism equivalent to Claude's hooks. But looking for alternatives, I found [this](https://happy.engineering/).
<figure><img src='/assets/images/2026-01-13-agentic-notifications/2026-01-13-22-39-21.png' alt='Terminal running Happy inside a project' /><figcaption>Terminal running Happy inside a project</figcaption></figure><br/>

It is an open-source tool that lets you run and control AI coding agents (Claude Code and Codex) from multiple devices. You install a client TypeScript app on your computer. That app wraps the AI session and syncs it with a mobile/web client (presumably) securely, so you can start a session on your machine and continue it from your phone or browser.

As an additional advantage, you get mobile notifications telling you if Codex is done or needs info.


<figure><img src='/assets/images/2026-01-13-agentic-notifications/2026-01-13-22-39-40.png' alt='Happy web app' /><figcaption>Happy web app</figcaption></figure><br/>

As far as I can tell, it is a legit app, not a trap to steal your data and encrypt your disc, but use it at your own risk!