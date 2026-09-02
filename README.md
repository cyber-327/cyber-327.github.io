# `cyber327.github.io`

Student-facing GitHub Pages site for `CYBER 327`.

This repo should contain only publish-safe material such as:

- Weekly study guides
- Lab handouts
- Public syllabus
- Equipment lists
- Safety notes
- Public course overview information

Do not place private planning documents, previous tests, quizzes, answer keys,
or instructor-only material in this repo.

## Suggested Workflow

1. Draft and review material in the private `digicomm` repo.
2. Run `python3 -B tools/build_publish_site.py` from the parent `digicomm` repo.
3. Review the generated pages for student-safe content and working links.
4. Commit and push this repo independently from the parent planning repo.

The generator creates stable pages for Weeks 1-15 and Labs 1-13. On each build,
content becomes available at the start of its scheduled week; future pages are
content-free placeholders. GitHub Pages does not rebuild this private source,
so regenerate and push the public repo when a new week begins. Release
overrides are stored only in the private parent repo at
`planning/course/site-release.json`.

Use `--as-of YYYY-MM-DD` to test the site at a specific date,
`--release-all` for a complete instructor review build, or `--max-week N` for
a partial build. Always run the normal command again before publishing if a
review build should not expose future material.

## Initial Structure

- `index.html` - landing page
- `syllabus/` - public syllabus generated from the private syllabus draft
- `theme.css` - public design tokens for colors, fonts, surfaces, and shape
- `styles.css` - shared structural and component styling
- `weeks/` - weekly lecture guides, key terms, equations, and study questions
- `labs/` - lab handouts, equipment, procedures, deliverables, and guardrails
- `assets/` - images and downloadable public files

## Theme Workflow

The public appearance is split into two layers:

- Edit `theme.css` for normal visual customization.
- Edit `styles.css` only when changing component layout or responsive behavior.

The private parent repository contains `design/theme-preview.html`, which can
preview, import, and export the supported theme tokens. The editor itself is
not public and cannot deploy changes. After replacing `theme.css`, regenerate
the pages, review accessibility and responsive behavior, then commit and push
this repository explicitly.
