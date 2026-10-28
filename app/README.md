# Brief-to-Creative Planner

A small local web prototype for marketing-agency teams. Enter a fictional campaign brief and get an editable creative draft: target audience, key message, one concept per channel, assumptions, and questions to clarify.

## Run

```bash
npm install
npm start
```

Open http://localhost:3000

## Test

```bash
npm test
```

8 automated tests cover constraint preservation, tone/constraint conflicts, unsupported claims, channel coverage, thin source notes, and audience/offer mismatches.

## The 10-brief evaluation

With the app running, from the parent folder:

```bash
node demo/evaluate.js
```

Results are written to `demo/report/` and summarized in `TEST_RESULTS.md`.

## Features

- Brief form: objective, audience, product, tone, channels, constraints, source notes.
- Editable draft with per-channel concept cards (headline, body, CTA, notes).
- Constraints preserved verbatim and shown in a dedicated section.
- Assumptions and clarifying questions are always visible.
- Clear error state for an empty brief or failed generation.
- 4 fictional sample briefs; switching samples clears the old draft.
- Export to JSON, Markdown, plain text, or clipboard.

## Scope

No authentication, third-party integrations, file uploads, or multi-agent orchestration. Generation is deterministic and rule-based; no external API is called. All samples are fictional — do not use confidential client material.

See `../docs/BEFORE_AFTER.md` for the two weaknesses found during evaluation and how they were fixed.
