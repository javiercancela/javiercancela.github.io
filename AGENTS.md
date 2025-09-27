# Repository Guidelines

## Project Structure & Module Organization
The site is a Jekyll setup with content under `all_collections/_posts`, drafts in `drafts/`, shared HTML snippets in `_includes/`, and layouts in `_layouts/`. Static assets live in `assets/` (`css`, `js`, `images`, `icons`). Global configuration stays in `_config.yml`; update it when adding plugins, metadata, or collection settings.

## Build, Test, and Development Commands
Run `bundle install` once to sync Ruby gems. Use `bundle exec jekyll serve --livereload` for local preview at http://127.0.0.1:4000; it rebuilds when Markdown or layout files change. Execute `bundle exec jekyll build` before opening a PR to ensure `_site/` compiles cleanly.

## Coding Style & Naming Conventions
Posts use Markdown with YAML front matter (2-space indentation). Follow the `YYYY-MM-DD-title.md` naming convention inside `all_collections/_posts/`; keep slugs lowercase with hyphens. Prefer short paragraphs, fenced code blocks with language hints, and meaningful alt text for images stored under `assets/images/`. Keep custom SCSS organized inside `assets/css/`, and respect existing theme partials in `_includes/`.

## Testing Guidelines
Automated tests are minimal; rely on `bundle exec jekyll build` to surface Liquid or Markdown errors. For link or asset checks, run `bundle exec jekyll doctor` and spot-check the generated site locally. When a post introduces code samples, verify formatting and syntax highlighting in the browser preview.

## Commit & Pull Request Guidelines
Commits are concise and imperative (e.g., `Add RL overview`, `Fix pagination config`). Group related changes—content, assets, and configuration—in a single commit when possible. Pull requests should include: a short summary, any relevant issue links, screenshots or GIFs for visual changes, and confirmation that `jekyll build` ran without errors.

## Content Workflow Tips
Draft long-form posts under `drafts/` until ready to publish; move them into `all_collections/_posts/` with the final date when launching. Keep front matter consistent (`layout`, `title`, `description`, `tags` if used) so theme components render correctly. Update `assets/images/` with optimized files and reference them via `/assets/images/<name>.<ext>` in Markdown.
