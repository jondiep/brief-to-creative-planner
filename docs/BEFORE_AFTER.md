# Before / After: Two Weak Results and How They Were Fixed

These are real outputs from this prototype. The "before" outputs were captured before the fix; the "after" outputs were captured by rerunning the same brief after the change.

---

## Weak result 1 — a hard constraint was overridden by tone

**Fictional brief**

| Field | Value |
|---|---|
| Objective | Launch app |
| Product | AppX |
| Tone | playful |
| Constraints | no humor; must be serious |

**Before (v1)**

> Key message: **"Discover AppX to launch app! Fun, fresh, and memorable."**

**Why it is weak**

- It directly violates a hard constraint ("no humor").
- It contradicts the same brief's "must be serious" requirement.
- The conflict is not surfaced to the user, so a reviewer could miss it.

**Fix**

The generator now checks constraints before applying tone styling. If "no humor" or "must be serious" is present, it uses a neutral key message instead of adding a playful tagline.

**After**

> Key message: **"Discover AppX to launch app."**

The constraints are still echoed verbatim in the draft, and a human reviewer can see them in the "Preserved Constraints" section.

**Regression test**

`app/tests/eval.test.js` → *does not add playful copy when "no humor" is a constraint*

---

## Weak result 2 — an unsupported claim was repeated as fact

**Fictional brief**

| Field | Value |
|---|---|
| Objective | Claim best-in-class support |
| Product | HelpDesk Pro |
| Source notes | "It's good" |

**Before (v1)**

> Key message: **"Discover HelpDesk Pro to claim best-in-class support."**

**Why it is weak**

- "Best-in-class" is an absolute claim.
- The source notes provide no survey, benchmark, review, or data to support it.
- Repeating the claim in the draft makes it look approved, when it is not.

**Fix**

The generator now scans the objective and product for absolute claim language. When the source notes contain no evidence signal (number, percentage, study, survey, review, test, award, audit, data, or "verified"), it:

1. softens the claim in generated copy ("best-in-class" → "strong"),
2. adds an explicit assumption that the claim is unsupported,
3. asks the user what evidence supports the claim.

**After**

> Key message: **"Discover HelpDesk Pro to claim strong support."**

**Assumption surfaced**

> "The brief mentions "best-in-class" but the supplied notes provide no evidence; the draft avoids repeating it as fact."

**Question surfaced**

> "What evidence supports the claim "best-in-class"?"

**Regression test**

`app/tests/eval.test.js` → *removes an unsupported claim and asks for evidence*

---

## What stayed the same

- All user-supplied constraints are still preserved verbatim and echoed in the draft.
- Generated content remains a draft for human review, not a final asset.
- The app still runs locally with no authentication, integrations, file uploads, or multi-agent orchestration.
