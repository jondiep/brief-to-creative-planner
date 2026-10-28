/**
 * Evaluation harness for Brief-to-Creative Planner.
 * Runs 10 fictional briefs (including edge cases) against the local API
 * and writes a markdown + JSON report.
 *
 * Usage: node demo/evaluate.js
 * Requires the app to be running at http://localhost:3000
 */
const fs = require('fs');
const path = require('path');

const ENDPOINT = process.env.ENDPOINT || 'http://localhost:3000/api/generate';

const cases = [
  {
    id: 1,
    name: 'Missing audience',
    brief: { objective: 'Sell running shoes', product: 'PaceLine Sneakers' },
    expectQuestions: true,
  },
  {
    id: 2,
    name: 'Missing objective and audience',
    brief: { product: 'Nimbus Desk Lamp' },
    expectQuestions: true,
  },
  {
    id: 3,
    name: 'Playful tone but no humor',
    brief: {
      objective: 'Launch the Nimbus app',
      product: 'Nimbus',
      tone: 'playful',
      constraints: ['no humor', 'must be serious'],
    },
    expectQuestions: true,
    assertNoPlayfulPhrase: true,
  },
  {
    id: 4,
    name: 'Very restrictive word limits',
    brief: {
      objective: 'Promote weekend deal',
      product: 'Corner Cafe',
      constraints: ['max 10 words per headline', 'max 20 characters for CTA'],
    },
    expectQuestions: true,
  },
  {
    id: 5,
    name: 'Offer/audience mismatch',
    brief: {
      objective: 'Sell retirement plans',
      audience: 'Teenagers aged 13-17',
      product: 'RetireMax',
      channels: ['TikTok'],
    },
    expectQuestions: true,
  },
  {
    id: 6,
    name: 'Source notes too thin to support a claim',
    brief: {
      objective: 'Claim best-in-class support',
      product: 'HelpDesk Pro',
      sourceNotes: "It's good",
    },
    expectQuestions: true,
  },
  {
    id: 7,
    name: 'Empty brief',
    brief: {},
    expectError: true,
  },
  {
    id: 8,
    name: 'Only objective',
    brief: { objective: 'Increase brand awareness' },
    expectQuestions: true,
  },
  {
    id: 9,
    name: 'Conflicting tones',
    brief: {
      objective: 'Sell the Hover Mat',
      product: 'Hover Mat',
      tone: 'urgent and casual and formal',
    },
    expectQuestions: true,
  },
  {
    id: 10,
    name: 'Many channels, minimal information',
    brief: {
      objective: 'Drive online sales',
      product: 'Plot Twist Puzzle',
      channels: ['Email', 'Social', 'Web', 'Search', 'Radio'],
    },
    expectQuestions: true,
  },
];

const UNSUPPORTED_CLAIM_PATTERNS = [
  /\bguarantee(d)?\b/i,
  /\b100%\b/i,
  /\b#1\b/i,
  /\bnumber one\b/i,
  /\bbest[- ]in[- ]class\b/i,
  /\bclinically proven\b/i,
  /\binstantly\b/i,
  /\bcures?\b/i,
];

function collectDraftText(result) {
  const d = result.draft;
  const parts = [d.targetAudience, d.keyMessage];
  for (const c of d.concepts) parts.push(c.headline, c.body, c.cta, c.notes);
  return parts.join('\n');
}

function evaluateCase(testCase, payload) {
  const row = {
    id: testCase.id,
    name: testCase.name,
    status: payload.ok ? 'ok' : 'error',
    constraints_preserved: null,
    invented_facts: null,
    questions_surfaced: null,
    human_review: 'Yes',
    notes: '',
  };

  if (!payload.ok) {
    row.constraints_preserved = testCase.expectError ? 'n/a' : 'not tested';
    row.invented_facts = 'n/a';
    row.questions_surfaced = testCase.expectError ? 'n/a' : 'not tested';
    row.notes = `Error state shown: "${payload.error}". Expected: ${testCase.expectError ? 'yes' : 'no'}.`;
    row.passed = Boolean(testCase.expectError);
    return row;
  }

  if (testCase.expectError) {
    row.notes = 'Expected a clear error state but generation succeeded.';
    row.passed = false;
    return row;
  }

  const result = payload.result;
  const inputConstraints = testCase.brief.constraints || [];
  const echoed = result.briefEcho.constraints || [];
  const allPreserved = inputConstraints.every(c => echoed.includes(c));
  row.constraints_preserved = inputConstraints.length === 0
    ? 'n/a (none supplied)'
    : allPreserved ? 'Yes' : 'No';

  const draftText = collectDraftText(result);
  const invented = UNSUPPORTED_CLAIM_PATTERNS
    .filter(re => re.test(draftText))
    .map(re => re.source);
  const claimsDetected = invented.length > 0;
  row.invented_facts = claimsDetected
    ? `Review: draft repeats unsupported claim pattern(s) ${invented.join(', ')}`
    : 'No unsupported absolute claims detected';

  row.questions_surfaced = (result.draft.questions || []).length > 0 ? 'Yes' : 'No';

  if (testCase.assertNoPlayfulPhrase) {
    const playful = /fun,\s*fresh/i.test(draftText);
    if (playful) {
      row.notes = 'Playful phrase leaked despite "no humor" / "serious" constraints.';
      row.passed = false;
      return row;
    }
  }

  if (claimsDetected) {
    row.notes = `Draft repeats an unsupported absolute claim (${invented.join(', ')}); soften it or ask for evidence.`;
    row.passed = false;
    return row;
  }

  if (testCase.expectQuestions && row.questions_surfaced !== 'Yes') {
    row.notes = 'No clarification questions surfaced.';
    row.passed = false;
    return row;
  }

  row.notes = inputConstraints.length > 0
    ? `Constraints echoed in output: ${echoed.join('; ')}.`
    : 'No constraints supplied; assumptions and questions cover missing detail.';
  row.passed = true;
  return row;
}

async function main() {
  const rows = [];
  for (const testCase of cases) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCase.brief),
    });
    const payload = await res.json();
    rows.push(evaluateCase(testCase, payload));
  }

  const passed = rows.filter(r => r.passed).length;
  const out = { runAt: new Date().toISOString(), total: rows.length, passed, rows };

  const outDir = path.join(__dirname, 'report');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'evaluation.json'), JSON.stringify(out, null, 2));

  let md = '# Evaluation Report\n\n';
  md += `Run: ${out.runAt}\n\n`;
  md += `**${passed}/${rows.length} cases passed automated checks.**\n\n`;
  md += '| # | Case | Constraints followed | Invented facts | Questions surfaced | Needs human review | Automated check |\n';
  md += '|---|---|---|---|---|---|---|\n';
  for (const r of rows) {
    md += `| ${r.id} | ${r.name} | ${r.constraints_preserved} | ${r.invented_facts} | ${r.questions_surfaced} | ${r.human_review} | ${r.passed ? 'Pass' : 'Fail'} |\n`;
  }
  md += '\n## Notes\n\n';
  for (const r of rows) {
    md += `- **${r.id}. ${r.name}:** ${r.notes}\n`;
  }
  fs.writeFileSync(path.join(outDir, 'evaluation.md'), md);

  console.log(md);
  if (passed !== rows.length) process.exitCode = 1;
}

main().catch(err => {
  console.error('Evaluation failed:', err.message);
  process.exit(1);
});
