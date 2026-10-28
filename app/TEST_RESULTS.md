# Evaluation Results — 10 Fictional Briefs

Date: 2026-10-28

Automated harness: `demo/evaluate.js` (run against the local API). Full output: `demo/report/evaluation.md` and `evaluation.json`.

**Result: 10/10 cases passed automated checks.**

| # | Case | Constraints followed | Unsupported claims | Questions surfaced | Needs human review |
|---|---|---|---|---|---|
| 1 | Missing audience | n/a (none supplied) | None detected | Yes | Yes — refine audience |
| 2 | Missing objective and audience | n/a (none supplied) | None detected | Yes | Yes — needs both |
| 3 | Playful tone but "no humor" | Yes — echoed; no playful tagline added | None detected | Yes | Yes — confirm tone resolution |
| 4 | Very restrictive word limits | Yes — echoed verbatim | None detected | Yes — asks for exact per-channel limits | Yes — hard truncation is not enforced |
| 5 | Retirement product aimed at teenagers | n/a (none supplied) | None detected | Yes — flags offer/audience mismatch | Yes — confirm audience or offer |
| 6 | Source notes too thin to support a claim | n/a (none supplied) | None — claim softened, evidence requested | Yes — asks what evidence supports the claim | Yes — legal/brand review |
| 7 | Empty brief | n/a | n/a | n/a | Yes — shows clear error state |
| 8 | Only objective | n/a (none supplied) | None detected | Yes | Yes — needs audience/product/channel detail |
| 9 | Conflicting tones | n/a (none supplied) | None detected | Yes | Yes — pick one primary tone |
| 10 | Many channels, minimal information | n/a (none supplied) | None detected | Yes | Yes — prioritize channels and specs |

## Fixes applied during evaluation

1. **Tone vs. constraint conflict (case 3).** "No humor"/"must be serious" now blocks the playful tagline. Regression test added.
2. **Unsupported claim (case 6).** Absolute claims in the objective/product are softened when source notes contain no evidence signal; an assumption and an evidence question are surfaced. Regression test added.
3. **Audience/offer mismatch (case 5).** Added detection for obvious mismatches such as a retirement product aimed at teenagers, with a clarifying question.
4. **Word/character-limit constraints (case 4).** The app preserves the constraint and asks for exact per-channel limits. It does not yet enforce truncation — flagged for human review.
5. **Thin source notes.** Notes under 20 characters trigger an assumption that more proof points are needed.

## Limitations

- Generation is template-based; output quality is intentionally modest and meant as a starting draft.
- Automated checks use keyword heuristics; they are not a substitute for brand, legal, or factual review.
- Word/character limits are surfaced but not automatically enforced.
- All samples are fictional; no confidential client material is used.
