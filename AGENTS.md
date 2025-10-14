# Repository Guidelines

## Project Structure & Module Organization
This is a Jekyll site. Published posts live in `all_collections/_posts/`, drafts in `_drafts/`, and shared snippets in `_includes/`. Layouts are in `_layouts/`, while CSS, JavaScript, images, and icons live under `assets/`. Update `_config.yml` when you add plugins, metadata, or collection settings so the build stays consistent.

## Build, Test, and Development Commands
Run `bundle install` once to sync Ruby gems. Use `bundle exec jekyll serve --livereload` for local preview at `http://127.0.0.1:4000/`; the server rebuilds on Markdown or layout changes. Execute `bundle exec jekyll build` before opening a PR to verify `_site/` compiles. Spot-check links and configuration issues with `bundle exec jekyll doctor`.

## Coding Style & Naming Conventions
Front matter uses YAML with 2-space indentation. Name posts `YYYY-MM-DD-slug.md`, keeping slugs lowercase with hyphens. Favor short paragraphs, fenced code blocks with language labels, and descriptive image alt text referencing `/assets/images/<file>`. Keep custom SCSS in `assets/css/` and respect existing theme partials in `_includes/`.

## Testing Guidelines
There is no automated test suite; rely on `bundle exec jekyll build` to catch Liquid or Markdown errors. For new code samples or embeds, preview via `bundle exec jekyll serve --livereload` and ensure syntax highlighting renders correctly. Run `bundle exec jekyll doctor` when you change URLs or assets to surface broken references early.

## Commit & Pull Request Guidelines
Write imperative commit messages such as `Add RL overview` or `Fix pagination config`. Group related content, assets, and configuration updates together. For pull requests, include a short summary, link relevant issues, attach screenshots or GIFs for visual changes, and confirm that `bundle exec jekyll build` completed cleanly.

## Content Workflow Tips
Draft long-form articles in `_drafts/` until ready to publish; move them into `all_collections/_posts/` with the launch date. Keep front matter consistent (`layout`, `title`, `description`, `tags` as needed). Optimize new media before placing it in `assets/images/`, and reference it using absolute paths such as `/assets/images/example.png`.
