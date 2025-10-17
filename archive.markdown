---
layout: page
title: Archive
permalink: /archive/
order: 3
hero_subtitle: Every post, organized by year.
---

<section class="archive-index">
  <div class="container">
    {% assign posts_by_year = site.posts | group_by_exp: 'post', "post.date | date: '%Y'" %}
    {% assign posts_by_year = posts_by_year | sort: 'name' | reverse %}
    {% if posts_by_year.size > 0 %}
      {% for group in posts_by_year %}
        <h2 class="archive-index__year">{{ group.name }}</h2>
        <ul class="archive-index__list">
          {% for post in group.items %}
            <li class="archive-index__item">
              <span class="archive-index__date">{{ post.date | date: '%b %-d' }}</span>
              <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
            </li>
          {% endfor %}
        </ul>
      {% endfor %}
    {% else %}
      <p class="archive-index__empty">No posts available yet.</p>
    {% endif %}
  </div>
</section>
