# `cyber327.github.io`

Student-facing GitHub Pages site for `CYBER 327`.

This repo should contain only publish-safe material such as:

- Weekly study guides
- Lab handouts
- Equipment lists
- Safety notes
- Public course overview information

Do not place private planning documents, previous tests, quizzes, answer keys,
or instructor-only material in this repo.

## Suggested Workflow

1. Draft and review material in the private `digicomm` repo.
2. Run `python3 tools/build_publish_site.py` from the parent `digicomm` repo.
3. Review the generated pages for student-safe content and working links.
4. Commit and push this repo independently from the parent planning repo.

The generator publishes Weeks 1-15 and Labs 1-13 by default. Use
`--max-week N` for a partial local build when reviewing an earlier portion of
the semester.

## Initial Structure

- `index.html` - landing page
- `styles.css` - shared site styling
- `weeks/` - weekly lecture guides, key terms, equations, and study questions
- `labs/` - lab handouts, equipment, procedures, deliverables, and guardrails
- `assets/` - images and downloadable public files
