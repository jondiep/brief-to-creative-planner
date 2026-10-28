# Brief-to-Creative Planner — Portfolio Demo Package

A small local web prototype for marketing-agency teams: enter a fictional campaign brief, get an editable creative draft. This folder contains the app, the evaluation harness, test results, a before/after write-up, portfolio copy, and a recorded demo.

## Folder structure

```
.
├── app/                        # The runnable prototype
│   ├── server.js               # Express server + deterministic generator
│   ├── public/                 # index.html, style.css, app.js
│   ├── samples/briefs.json     # 4 fictional sample briefs
│   ├── tests/eval.test.js      # 8 automated tests
│   ├── README.md               # App-level notes
│   └── TEST_RESULTS.md         # Edge-case evaluation summary
├── demo/
│   ├── evaluate.js             # Runs 10 fictional briefs against the API
│   ├── record-demo.js          # Playwright screen recorder
│   ├── report/                 # Generated evaluation.json / evaluation.md
│   └── video/
│       ├── brief-to-creative-demo.webm
│       └── exported-draft.md
├── docs/
│   ├── BEFORE_AFTER.md         # One weak result, fixed; plus a second fix
│   ├── PORTFOLIO.md            # Verified portfolio/application copy
│   └── DEMO_SCRIPT.md          # Shot list and narration
└── package.json                # Demo tooling only (Playwright)
```

## Run the app

Requires Node.js 18+ (tested on Node 20).

```bash
cd app
npm install
npm start
```

Open http://localhost:3000

### Demo flow

1. Click **Product Launch** to load a fictional sample brief.
2. Click **Generate Draft**.
3. Edit any field — target audience, key message, each channel concept, assumptions, questions.
4. Check **Preserved Constraints** — the brief's constraints are echoed verbatim.
5. Switch to another sample: the previous draft is cleared.
6. Export via JSON, Markdown, plain text, or clipboard.

## Run the automated tests

```bash
cd app
npm test
```

Expected: **8/8 tests pass**.

## Run the 10-brief evaluation

Start the app first, then from this folder:

```bash
node demo/evaluate.js
```

It writes `demo/report/evaluation.md` and `.json`. Expected: **10/10 cases pass**.

## Watch or re-record the demo

Watch `demo/video/brief-to-creative-demo.webm` in Chrome (or any WebM-capable player). A still frame is available at `demo/video/poster.png`.

Re-record with the app running:

```bash
npm install          # installs Playwright once
node demo/record-demo.js
```

The recorder uses the locally installed Google Chrome and Playwright's bundled ffmpeg. No browser download is needed, though `npx playwright install ffmpeg` may be required once.

## GitHub integration

`opencode github install` is a V1 command and is not available in OpenCode v2.2.0. A manual GitHub Actions workflow is included instead:

- Workflow: `.github/workflows/opencode.yml`
- Setup instructions and remaining steps: `docs/GITHUB.md`

The workflow still needs a GitHub remote, an `OPENCODE_API_KEY` repository secret, and a push before it can run.

## Scope

Deliberately excluded: authentication, third-party integrations, file uploads, multi-agent orchestration. All briefs in `samples/` and `demo/` are fictional. Do not put confidential client material in the app.

## Verified claims

- 10 fictional briefs evaluated; 10/10 passed automated checks after fixes.
- 8/8 automated tests pass.
- 2 weaknesses found and fixed with regression tests (see `docs/BEFORE_AFTER.md`).
- 4 fictional sample briefs.
- 4 export formats.
- Demo video is ~50 seconds.
- Generation is deterministic and rule-based; no LLM is called at runtime.
