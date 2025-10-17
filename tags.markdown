---
layout: page
title: Tags
permalink: /tags/
order: 2
hero_subtitle: Browse posts by topic.
---

<section class="tag-index">
  <div class="container">
    {% if site.tags %}
      {% assign sorted_tags = site.tags | sort %}
      <ul class="tag-index__list">
        {% for tag in sorted_tags %}
          {% assign tag_name = tag[0] %}
          {% assign tag_posts = tag[1] %}
          {% assign tag_slug = tag_name | slugify: 'latin' %}
          <li class="tag-index__item">
            <a href="{{ '/tag/' | append: tag_slug | append: '/' | relative_url }}">
              {{ tag_name }}
              <span class="tag-index__count">({{ tag_posts | size }})</span>
            </a>
          </li>
        {% endfor %}
      </ul>
    {% else %}
      <p class="tag-index__empty">No tags available yet.</p>
    {% endif %}
  </div>
</section>
