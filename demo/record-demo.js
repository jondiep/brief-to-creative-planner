/**
 * Records a short walkthrough video of the app using Playwright.
 * Uses the locally installed Google Chrome (channel: 'chrome') so no
 * browser download is required.
 *
 * Usage:
 *   1. Start the app: cd app && npm start
 *   2. node demo/record-demo.js
 * Output: demo/video/brief-to-creative-demo.webm
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const OUT_DIR = path.join(__dirname, 'video');
fs.mkdirSync(OUT_DIR, { recursive: true });

async function caption(page, text, subtext = '') {
  await page.evaluate(({ text, subtext }) => {
    let el = document.getElementById('__demo_caption');
    if (!el) {
      el = document.createElement('div');
      el.id = '__demo_caption';
      el.style.cssText = [
        'position:fixed', 'left:50%', 'bottom:28px', 'transform:translateX(-50%)',
        'z-index:99999', 'background:rgba(17,24,39,.94)', 'color:#fff',
        'padding:14px 22px', 'border-radius:10px', 'font:600 17px/1.35 -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif',
        'box-shadow:0 8px 28px rgba(0,0,0,.35)', 'max-width:760px', 'text-align:center',
        'pointer-events:none', 'transition:opacity .2s',
      ].join(';');
      document.body.appendChild(el);
    }
    el.innerHTML = `<div>${text}</div>` + (subtext ? `<div style="font-weight:400;font-size:13px;opacity:.8;margin-top:4px">${subtext}</div>` : '');
  }, { text, subtext });
}

async function smoothScroll(page, selector, block = 'start') {
  await page.evaluate(({ selector, block }) => {
    const el = document.querySelector(selector);
    if (el) el.scrollIntoView({ behavior: 'smooth', block });
  }, { selector, block });
  await pause(900);
}

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 860 },
    recordVideo: { dir: OUT_DIR, size: { width: 1280, height: 860 } },
  });
  const page = await context.newPage();

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await pause(1200);
  await caption(page, 'Brief-to-Creative Planner', 'A local prototype that turns a campaign brief into an editable creative draft');
  await pause(2600);

  // 1. Sample brief
  await caption(page, '1. Pick a fictional sample brief', 'No confidential client material — all samples are invented');
  await page.click('[data-sample="launch"]');
  await pause(900);
  await smoothScroll(page, '.brief-form', 'start');
  await pause(1300);
  await caption(page, 'Brief fields are pre-filled', 'Objective, audience, product, tone, channels, constraints, source notes');
  await pause(2200);

  // 2. Generate
  await caption(page, '2. Generate the draft', 'One concept per channel, plus assumptions and clarifying questions');
  await page.click('.generate-btn');
  await page.waitForSelector('#draftSection', { state: 'visible' });
  await pause(1100);
  await smoothScroll(page, '#draftSection', 'start');
  await pause(2200);

  await caption(page, 'Editable creative draft', 'Target audience and key message — every field can be edited');
  await pause(2200);
  await smoothScroll(page, '#conceptsContainer', 'start');
  await caption(page, 'One concept per channel', 'Headline, body, CTA and production notes for each channel');
  await pause(2600);
  await smoothScroll(page, '#assumptionsList', 'start');
  await caption(page, 'Assumptions are explicit', 'The draft says what it inferred rather than hiding it');
  await pause(2200);
  await smoothScroll(page, '.constraints-echo', 'start');
  await caption(page, 'Constraints are preserved verbatim', 'Your original constraints are echoed for review');
  await pause(2400);

  // 3. Switching samples clears stale draft
  await caption(page, '3. Switching samples clears the old draft', 'No stale output from the previous brief');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await pause(900);
  await page.click('[data-sample="event"]');
  await pause(1400);
  const draftVisible = await page.isVisible('#draftSection');
  await caption(page, draftVisible ? 'Draft still visible (unexpected)' : 'Draft cleared', 'The form now shows the Event Promotion brief');
  await pause(2400);

  // 4. Edge case: playful tone but no humor
  await page.fill('#objective', 'Launch the Nimbus app');
  await page.fill('#audience', 'Busy commuters aged 25-40');
  await page.fill('#product', 'Nimbus');
  await page.fill('#tone', 'playful');
  await page.fill('#channels', 'Instagram, Email');
  await page.fill('#constraints', 'no humor\nmust be serious');
  await page.fill('#sourceNotes', 'Nimbus helps commuters plan a calmer route.');
  await pause(900);
  await caption(page, '4. Edge case: playful tone, but "no humor"', 'Conflicting requirements are preserved, not silently dropped');
  await pause(2400);
  await page.click('.generate-btn');
  await page.waitForSelector('#draftSection', { state: 'visible' });
  await pause(900);
  await smoothScroll(page, '#draftSection', 'start');
  await pause(2400);
  await smoothScroll(page, '.constraints-echo', 'start');
  await caption(page, 'Constraint-safe output', 'No playful tagline is added when humor is prohibited');
  await pause(2600);

  // 5. Export
  await smoothScroll(page, '.export-block', 'start');
  await caption(page, '5. Export the edited draft', 'JSON for tools, Markdown for docs, plain text, or copy to clipboard');
  await pause(1800);
  const downloadPromise = page.waitForEvent('download');
  await page.click('#exportMdBtn');
  const download = await downloadPromise;
  await download.saveAs(path.join(OUT_DIR, 'exported-draft.md'));
  await pause(1600);

  await caption(page, 'Small, local, testable', '10 fictional briefs evaluated for constraint-following and unsupported claims');
  await pause(3200);

  await context.close();
  await browser.close();

  const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'));
  const latest = files
    .map(f => ({ f, t: fs.statSync(path.join(OUT_DIR, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t)[0];

  const finalName = path.join(OUT_DIR, 'brief-to-creative-demo.webm');
  if (latest) {
    fs.renameSync(path.join(OUT_DIR, latest.f), finalName);
    console.log('Video saved:', finalName);
  }
  console.log('Exported Markdown sample:', path.join(OUT_DIR, 'exported-draft.md'));
}

main().catch(err => {
  console.error('Demo recording failed:', err);
  process.exit(1);
});
