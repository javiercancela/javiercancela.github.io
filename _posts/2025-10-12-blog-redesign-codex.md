---
layout: post
title: Redesigning the blog
subtitle: In which I use Codex to fake my way into web design
date: 2025-10-12
tags:
  - codex
---

# I got tired of my blog design

I like that it was simple, but it feels too.. big? Rough? The content is rough, but the design doesn't have to be.

<figure>
  <img src="/assets/images/2025-10-12-blog-redesign-codex/2025-10-14-19-03-13.png" alt="My blog before the redesign" />
  <figcaption>My blog before the redesign</figcaption>
</figure><br/>
<figure>
  <img src="/assets/images/2025-10-12-blog-redesign-codex/2025-10-14-19-04-01.png" alt="Everything looks too big!" />
  <figcaption>Everything looks too big!</figcaption>
</figure><br/>

So I decided to install Jekyll from scratch.

<figure>
  <img src="/assets/images/2025-10-12-blog-redesign-codex/2025-10-18-17-46-34.png" alt="The default Jekyll them" />
  <figcaption>The default Jekyll them</figcaption>
</figure><br/>

And I initialized Codex on the blog's folder, to give him some instructions:

> The project is a Jekyll blog that will be published in GitHub Pages. Modify the styles to give it a modern but simple theme.

The first modification didn't work, and no styles were applied to the blog. I screenshoted the result to show Codex (I didn't keep the screenshot):
> Now the blog shows with no styles at all. You can see a screenshot in the file ./blog.png.

Once this was fixed (I was vibe coding, so I didn't even try to see what was wrong), the results were much better:
<figure>
  <img src="/assets/images/2025-10-12-blog-redesign-codex/2025-10-18-17-57-51.png" alt="The post card overlaps with the header" />
  <figcaption>The post card overlaps with the header</figcaption>
</figure><br/>

> There is a small glitch in the UI. In the main page, the first post card overlaps slightly with the header, so the card is cut on the top. If I hover the mouse, the card raises a little and it is shown in full. Can you fix this?

Despite taking a screenshot, I didn't attach it to the conversation, but Codex fixed the issue (despite the grammatical errors, I don't use Grammarly for the prompts!).

Now I wanted to add an image to the header:
> Put an image as a header background

There was a bug inside the posts, with the images overflowing the layout on the right:
> The posts have images in \<figure\>\<img\> tags. Make sure that images have a limited width so the fit into the page layout

The first version showed the tags in the posts, but no links and no tags page:
> Modify the code so when you click a tag in a post it brings you to a page where you can see all the posts with that tag

Codex decided to show all the tags in the header, so I asked Codex to fix it.
> The blog shows each individual tag in the header. Change this to show a single Tags option in the header, linked to a page that displays all the tags

Finally, I added an Archive page:
> Add also an Archive option, listing all the pages by date

And that's it. The result is this design (in case I decide to change it in the future):
<figure>
  <img src="/assets/images/2025-10-12-blog-redesign-codex/2025-10-18-20-53-06.png" alt="Not great, not terrible" />
  <figcaption>Not great, not terrible</figcaption>
</figure><br/>

I'm going to call this design "3.6 roentgen": not great, not terrible.