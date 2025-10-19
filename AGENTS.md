# Repository Guidelines

Maintain this Jekyll site with clear structure, consistent formatting, and repeatable workflows. Follow the practices below before opening a pull request.

## Project Structure & Module Organization
- `_config.yml` defines global metadata, navigation, and defaults; update it when adding layouts or site-wide settings.
- `_posts/` stores published articles in `YYYY-MM-DD-title.md` format with YAML front matter.
- `index.markdown` and `about.markdown` act as static pages—mirror their front matter if you add new top-level pages.
- Assets such as images live under `assets/` using lowercase hyphenated names (e.g., `assets/images/site-logo.png`).
- `_site/` is build output; never edit or commit content from this directory.

## Build, Test, and Development Commands
- `bundle install` installs gem dependencies from `Gemfile`.
- `bundle exec jekyll serve --livereload` starts the local server at `http://localhost:4000` with automatic rebuilds.
- `bundle exec jekyll build` produces the production-ready `_site/`; combine with `JEKYLL_ENV=production` for deploy previews.
- `bundle exec jekyll doctor` reports common configuration or content issues to fix before committing.

## Coding Style & Naming Conventions
- Use Markdown with semantic headings and fenced code blocks; wrap lines near 100 characters.
- Keep YAML indentation at two spaces in front matter and `_config.yml`.
- Reference assets with absolute paths (e.g., `/assets/images/diagram.png`) to avoid broken links.
- Avoid adding non-ASCII characters unless the surrounding content already relies on them.

## Testing Guidelines
- Treat `bundle exec jekyll build` as the primary regression test; resolve any warnings or errors before commits.
- For Liquid or layout updates, create a temporary draft in `_posts/` to validate new includes or filters locally.
- Capture a screenshot from `jekyll serve` when adjusting layout, typography, or assets.

## Commit & Pull Request Guidelines
- Write imperative commit messages under 72 characters (`posts: add spring recap`).
- PR descriptions should summarize changes, list affected URLs, and link tracking issues.
- Confirm that `bundle exec jekyll build` completes successfully and note any follow-up tasks as bullets.
- Attach relevant screenshots or GIFs when the UI changes visibly.
