const assert = require('assert');
const { generateDraft } = require('../server');

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (err) {
    console.error(`✗ ${name}`);
    throw err;
  }
}

function allDraftText(result) {
  const d = result.draft;
  const parts = [d.targetAudience, d.keyMessage];
  for (const c of d.concepts) parts.push(c.headline, c.body, c.cta, c.notes);
  return parts.join('\n');
}

test('requires objective or product', () => {
  assert.throws(() => generateDraft({}), /at least an objective or product/i);
});

test('preserves every supplied constraint verbatim', () => {
  const constraints = ['Must use approved fonts', 'Budget under $1000', 'No competitor mentions'];
  const result = generateDraft({ objective: 'Test objective', product: 'Test Product', constraints });
  assert.deepStrictEqual(result.briefEcho.constraints, constraints);
});

test('does not add playful copy when "no humor" is a constraint', () => {
  const result = generateDraft({
    objective: 'Launch the app',
    product: 'AppX',
    tone: 'playful',
    constraints: ['no humor', 'must be serious'],
  });
  assert.ok(!/fun,\s*fresh/i.test(allDraftText(result)), 'playful phrase should not appear');
});

test('generates one concept per supplied channel', () => {
  const channels = ['Instagram', 'Email', 'Landing Page'];
  const result = generateDraft({ objective: 'Test', product: 'Widget', channels });
  assert.strictEqual(result.draft.concepts.length, channels.length);
  assert.deepStrictEqual(result.draft.concepts.map(c => c.channel), channels);
});

test('surfaces a question when source notes are too thin', () => {
  const result = generateDraft({ objective: 'Claim best-in-class support', product: 'HelpDesk Pro', sourceNotes: "It's good" });
  assert.ok(result.draft.assumptions.some(a => /proof points|brief/i.test(a)));
  assert.ok(result.draft.questions.some(q => /proof points/i.test(q)));
});

test('does not invent absolute claims when proof is absent', () => {
  const result = generateDraft({ objective: 'Increase sales', product: 'Mystery Product' });
  const text = allDraftText(result);
  assert.ok(!/\bguaranteed\b|\b100%\b|\b#1\b|\bclinically proven\b/i.test(text));
});

test('removes an unsupported claim and asks for evidence', () => {
  const result = generateDraft({
    objective: 'Claim best-in-class support',
    product: 'HelpDesk Pro',
    sourceNotes: "It's good",
  });
  const text = allDraftText(result);
  assert.ok(!/best[- ]in[- ]class/i.test(text), 'draft copy should not repeat the unsupported claim');
  assert.ok(result.draft.questions.some(q => /evidence supports/i.test(q)));
  assert.ok(result.draft.assumptions.some(a => /no evidence/i.test(a)));
});

test('surfaces audience/offer mismatch question', () => {
  const result = generateDraft({
    objective: 'Sell retirement plans',
    audience: 'Teenagers',
    product: 'RetireMax',
    channels: ['TikTok'],
  });
  assert.ok(result.draft.questions.some(q => /fit this audience|channel appropriate/i.test(q)));
});

console.log('\n✅ All tests passed!');
