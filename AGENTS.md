# Repository Guidelines

## Project Structure & Module Organization
- `_config.yml` holds the Jekyll site configuration; update defaults, navigation, and metadata here.
- `_posts/` contains published articles using the `YYYY-MM-DD-title.md` pattern with YAML front matter; treat each file as a Markdown module.
- `index.markdown` and `about.markdown` provide landing and bio pages; mirror their front matter when adding new static pages.
- `_site/` is the generated output from Jekyll builds—never edit files here, and add to `.gitignore` if it ever appears untracked.

## Build, Test, and Development Commands
- `bundle install` ensures Ruby gems from `Gemfile` are available before local development.
- `bundle exec jekyll serve --livereload` runs the site locally on `http://localhost:4000`, rebuilding when Markdown or assets change.
- `bundle exec jekyll build` produces a production-ready `_site/`; pair it with `JEKYLL_ENV=production` for deploy previews.
- `bundle exec jekyll doctor` scans for common configuration and content issues before pushing.

## Coding Style & Naming Conventions
- Prefer Markdown with fenced code blocks and semantic headings; keep line wraps at ~100 chars for readability.
- Use two-space indentation in YAML front matter and `_config.yml` to match existing files.
- Name images and assets with lowercase hyphenated tokens (`assets/images/site-logo.png`) and reference them with absolute paths.

## Testing Guidelines
- Run `bundle exec jekyll build` before every commit; treat warnings as blockers.
- For layout or styling changes, capture a local screenshot from `jekyll serve` to attach in the PR.
- When adding liquid logic, add a throwaway draft in `_posts/` to exercise new includes or filters and verify the rendered HTML locally.

## Commit & Pull Request Guidelines
- Use imperative, scoped commit messages (`posts: add spring recap`) and keep subjects under 72 characters.
- In PR descriptions, summarize the change, list impacted URLs, and link tracking issues; attach screenshots or GIFs when UI shifts.
- Confirm you ran `jekyll build` in the PR checklist and call out any follow-up tasks in bullet form.
