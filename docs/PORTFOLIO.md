# Portfolio / Application Copy

Only claims verified in this folder are used below. Update the role sentence if your involvement differed.

## Short version

**Brief-to-Creative Planner** — a local web prototype that turns a fictional campaign brief into an editable creative draft. Built with OpenCode's coding agent using Node.js, Express, and vanilla JavaScript. I directed the product scope and evaluation criteria; the coding agent implemented the app, wrote the test harness, and recorded the demo. I evaluated the output against 10 fictional briefs for constraint-following, unsupported claims, and usefulness of clarifying questions. Two weaknesses found during evaluation were fixed, with regression tests. No authentication, integrations, file uploads, or multi-agent orchestration.

## Longer version

**Brief-to-Creative Planner** is a small local web app for marketing-agency teams. A user enters a campaign brief — objective, audience, product, tone, channels, constraints, and source notes — and receives an editable draft containing a target audience, key message, one concept per channel, assumptions, and questions for the user to clarify.

**Role and process.** I set the scope and acceptance criteria, defined the edge cases, and reviewed the generated output. Implementation, the automated evaluation harness, and the screen-recorded demo were produced with OpenCode's coding agent. I iterated with the agent when tests exposed problems, then reran the checks.

**Verified results**
- 10 fictional briefs evaluated, including missing objective/audience, conflicting tone, restrictive word limits, audience/channel mismatch, thin source notes, and an empty brief.
- 10/10 passed the automated checks after fixes.
- 8/8 automated tests pass.
- 2 concrete weaknesses found and fixed:
  1. A playful tagline was added despite a "no humor" constraint.
  2. An unsupported "best-in-class" claim was repeated as fact when source notes had no evidence.
- 4 fictional sample briefs included.
- 4 export options: JSON, Markdown, plain text, and clipboard.
- Demo video: ~50 seconds, `demo/video/brief-to-creative-demo.webm`.

**Deliberately out of scope:** authentication, third-party integrations, file uploads, and multi-agent orchestration. No confidential client material is included.

## Suggested one-line CV entry

> Built and evaluated a local brief-to-creative web prototype with OpenCode's coding agent (Node.js/Express, vanilla JS); tested 10 fictional briefs for constraint-following and unsupported claims, fixing 2 failure modes with regression tests.

## Do not claim

- Do not say "12 briefs" — this build verified 10.
- Do not say it uses an LLM at runtime — generation is deterministic and rule-based.
- Do not call it production-ready — it is a prototype for human review.
