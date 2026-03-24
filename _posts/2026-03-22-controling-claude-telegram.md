---
layout: post
title: Using Telegram to control Claude
date: 2026-03-22
tags:
 - claude
---

Anthropic has just released a feature called [Channels](https://code.claude.com/docs/en/channels-reference), which allows a Claude session to communicate with an external system in one of two ways:
- listening for events on an HTTP port
- polling an external API

<figure><img src="/assets/images/2026-03-23-10-10-10.png" alt="From https://code.claude.com/docs/en/channels-reference"/><figcaption><em>From https://code.claude.com/docs/en/channels-reference</em></figcaption></figure><br/>

The channel is an MCP server automatically run when we use the `--channels` parameter when launching Claude.

# Testing channels with Telegram

We first need to create a [Telegram bot](https://core.telegram.org/bots/features#creating-a-new-bot) and safely store the bot token.
<figure><img src="/assets/images/2026-03-23-11-12-20.png" alt="Creating a bot in Telegram"/><figcaption><em>Creating a bot in Telegram</em></figcaption></figure><br/>

We also have to verify that Claude's version is `2.1.80` or later. To run the MCP server, Claude also needs a JavaScript runtime. I'm using [bun](https://bun.sh/), but I think [node](https://nodejs.org/en) and [deno](https://deno.com/) are valid options too.

The next step is installing the Telegram plugin inside Claude:
```bash
/plugin marketplace add anthropics/claude-plugins-official # In case it wasn't already added
/plugin install telegram@claude-plugins-official
/reload-plugins
```

Now the Telegram plugin should be available, and we just have to configure the bot token:
```bash
/telegram:configure 123456789:AAHfiqksKZ8...
```

The final step is to pair the bot with Claude. For that, we DM the bot we created before:
<figure><img src='/assets/images/2026-03-23-controling-claude-telegram/2026-03-23-19-45-52.png' alt='If you did everything ok, you only need to say Hi! once' /><figcaption>If you did everything ok, you only need to say Hi! once</figcaption></figure><br/>

The bot's response includes the command to pair the session inside Claude:
```bash
/telegram:access pair a12345
```

I said 'Hi' three times because the MCP server for the channel wasn't working. I installed `bun` but I didn't make sure the `PATH` was updated, so the MCP server was failing. You can check the MCP server status with `/mcp`:

<figure><img src="/assets/images/2026-03-23-11-22-58.png" alt="Checking the mcp status"/><figcaption><em>Checking the mcp status</em></figcaption></figure><br/>

And that's it. Now I can use Telegram as a front-end for an existing Claude session:
<figure><img src='/assets/images/2026-03-23-controling-claude-telegram/2026-03-24-09-16-47.png' alt='Now I want the same for Codex' /><figcaption>Now I want the same for Codex</figcaption></figure><br/>