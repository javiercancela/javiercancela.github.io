---
layout: post
title: Using Telegram to control Claude
subtitle: In which I create a Telegram bot
date: 2027-03-22
tags:
 - claude
---

Anthropic has just released a feature called [Channels](https://code.claude.com/docs/en/channels-reference) which allows a Claude session to communicate with an external system in one of two ways:
- listening for events on a HTTP port
- polling an external API

<figure><img src="/assets/images/2026-03-23-10-10-10.png" alt="From https://code.claude.com/docs/en/channels-reference"/><figcaption><em>From https://code.claude.com/docs/en/channels-reference</em></figcaption></figure><br/>

The channel is an MCP server automatically run when we use the `--channels` param when launching Claude.

# Testing channels with Telegram

We first need to create a [Telegram bot](https://core.telegram.org/bots/features#creating-a-new-bot) and safely store the bot token.
<figure><img src="/assets/images/2026-03-23-11-12-20.png" alt="Creating a bot in Telegram"/><figcaption><em>Creating a bot in Telegram</em></figcaption></figure><br/>

We also have to verify that Claude's version is `2.1.80` or later. To run the MCP server Claude also needs a Javascript runtime. I'm using [bun](https://bun.sh/), but I think [node](https://nodejs.org/en) and [deno](https://deno.com/) are valid options too.

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

<figure><img src="/assets/images/2026-03-23-11-22-58.png" alt=""/><figcaption><em></em></figcaption></figure><br/>