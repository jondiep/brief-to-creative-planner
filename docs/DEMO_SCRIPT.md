# Demo Script / Shot List

The recorded walkthrough is `demo/video/brief-to-creative-demo.webm` (~50 seconds, 1280×860, VP9/WebM). It has on-screen captions, so it can be watched without narration.

To re-record:

```bash
# Terminal 1
cd app
npm install
npm start

# Terminal 2
cd ..
node demo/record-demo.js
```

The recorder uses the locally installed Google Chrome and Playwright's bundled ffmpeg. Output overwrites `demo/video/brief-to-creative-demo.webm` and also writes `demo/video/exported-draft.md`.

## Shot list

| Time | What is on screen | Caption |
|---|---|---|
| 0:00–0:04 | Title and empty form | Brief-to-Creative Planner / A local prototype that turns a campaign brief into an editable creative draft |
| 0:04–0:10 | Clicking the Product Launch sample | 1. Pick a fictional sample brief / No confidential client material — all samples are invented |
| 0:10–0:15 | Pre-filled form | Brief fields are pre-filled / Objective, audience, product, tone, channels, constraints, source notes |
| 0:15–0:21 | Generate + draft header | 2. Generate the draft / One concept per channel, plus assumptions and clarifying questions |
| 0:21–0:25 | Target audience and key message | Editable creative draft / Target audience and key message — every field can be edited |
| 0:25–0:30 | Per-channel concept cards | One concept per channel / Headline, body, CTA and production notes for each channel |
| 0:30–0:34 | Assumptions | Assumptions are explicit / The draft says what it inferred rather than hiding it |
| 0:34–0:38 | Preserved constraints | Constraints are preserved verbatim / Your original constraints are echoed for review |
| 0:38–0:42 | Switching to Event Promotion | 3. Switching samples clears the old draft / No stale output from the previous brief |
| 0:42–0:49 | Playful / no-humor edge case + constraints | 4. Edge case: playful tone, but "no humor" / Conflicting requirements are preserved, not silently dropped |
| 0:49–0:53 | Markdown export | 5. Export the edited draft / JSON for tools, Markdown for docs, plain text, or copy to clipboard |
| 0:53–0:57 | Wrap-up | Small, local, testable / 10 fictional briefs evaluated for constraint-following and unsupported claims |

*Timings are approximate; the actual file is 50.24 seconds.*

## Optional live narration

> "This is a small prototype that turns a campaign brief into a creative draft. I'll load a fictional product-launch brief — all sample data is invented. The form captures objective, audience, product, tone, channels, constraints, and source notes. Generating produces an editable draft: target audience, key message, one concept per channel, assumptions, and questions. Notice that constraints are echoed verbatim — the app never silently drops them. If I switch samples, the old draft is cleared so no stale output is mistaken for the new brief. I'll also test a conflict: playful tone with 'no humor'. The output stays neutral and keeps the constraint visible. Finally, the draft exports to Markdown, JSON, or plain text. The build was evaluated against 10 fictional briefs; two failure modes were found and fixed with regression tests."
