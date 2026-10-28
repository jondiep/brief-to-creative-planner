const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function generateDraft(brief) {
  try {
    const objective = (brief.objective || '').trim();
    const audience = (brief.audience || '').trim();
    const product = (brief.product || '').trim();
    const tone = (brief.tone || '').trim() || 'balanced and engaging';
    const channels = Array.isArray(brief.channels) ? brief.channels.filter(c => c && c.trim()) : 
                      (typeof brief.channels === 'string' ? brief.channels.split(',').map(c=>c.trim()).filter(Boolean) : []);
    const constraints = Array.isArray(brief.constraints) ? brief.constraints.filter(c => c && c.trim()) : 
                        (typeof brief.constraints === 'string' ? brief.constraints.split('\n').map(c=>c.trim()).filter(Boolean) : []);
    const sourceNotes = (brief.sourceNotes || brief.notes || '').trim();

    if (!objective && !product) {
      throw new Error('Please provide at least an objective or product.');
    }

    // Detect absolute claims that the supplied notes cannot support.
    const CLAIM_PATTERN = /\b(best[- ]in[- ]class|#1|number one|guaranteed|100%|clinically proven|instantly|cures?)\b/gi;
    const notesProvideEvidence = /\d|%|\bstudy\b|\bsurvey\b|\breview\b|\btest\b|\baward\b|\baudit\b|\bdata\b|\bverified\b/i.test(sourceNotes);
    const claimMatches = [...new Set((`${objective} ${product}`.match(CLAIM_PATTERN) || []).map(s => s.trim()))];
    const unsupportedClaims = notesProvideEvidence ? [] : claimMatches;
    const softenClaims = (text) => unsupportedClaims.length
      ? text.replace(CLAIM_PATTERN, 'strong')
      : text;

    // Build target audience description
    let targetAudience = audience;
    if (!targetAudience) {
      targetAudience = objective ? `People who would be motivated by: ${softenClaims(objective).toLowerCase()}` : 'Relevant audience for this offering';
    }

    // Build key message
    let keyMessage = '';
    if (objective && product) {
      keyMessage = `Discover ${product} to ${objective.replace(/^\w/, c => c.toLowerCase())}.`;
    } else if (product) {
      keyMessage = `${product} — designed to deliver on your goals.`;
    } else if (objective) {
      keyMessage = `Take action: ${objective}.`;
    } else {
      keyMessage = 'Compelling value proposition tailored to this campaign.';
    }
    // Tone adjustment - respect constraints
    const constraintsLower = constraints.map(c => c.toLowerCase());
    const hasNoHumor = constraintsLower.some(c => c.includes('no humor') || c.includes('humor') && c.includes('no'));
    const hasSerious = constraintsLower.some(c => c.includes('serious'));
    
    if (tone.toLowerCase().includes('playful') && !hasNoHumor && !hasSerious) {
      keyMessage = keyMessage.replace(/\.$/, '! Fun, fresh, and memorable.');
    } else if (tone.toLowerCase().includes('urgent')) {
      keyMessage = 'Act now — ' + keyMessage.charAt(0).toLowerCase() + keyMessage.slice(1);
    } else if (hasSerious || hasNoHumor) {
      // Keep tone more professional/neutral
      keyMessage = keyMessage.replace(/!.*$/, '.').replace('Fun, fresh, and memorable.', '');
    }
    keyMessage = softenClaims(keyMessage);

    // Generate concepts per channel
    const concepts = [];
    if (channels.length === 0) {
      channels.push('Social', 'Email');
    }
    for (const ch of channels) {
      const channelName = ch;
      let concept = {
        channel: channelName,
        headline: '',
        body: '',
        cta: '',
        notes: ''
      };
      const lowerCh = channelName.toLowerCase();
      if (lowerCh.includes('social') || lowerCh.includes('instagram') || lowerCh.includes('tiktok')) {
        concept.headline = product ? `Meet ${product}` : 'Big idea in one line';
        concept.body = `Show, don’t tell. ${tone} creative spotlighting the benefit: ${objective || 'solve a need'}. Keep it visual-first.`;
        concept.cta = 'Learn more';
        concept.notes = 'Optimize for vertical format; hook in first 3 seconds.';
      } else if (lowerCh.includes('email')) {
        concept.headline = objective ? `How ${product || 'we'} helps: ${objective}` : (product ? `Introducing ${product}` : 'Your next step');
        concept.body = `Personalized message: ${sourceNotes ? sourceNotes.substring(0, 100) + (sourceNotes.length>100?'...':'') : 'Focus on the core benefit.'} Keep copy scannable with bullets.`;
        concept.cta = 'Get started';
        concept.notes = 'Subject line A/B test recommended; include clear value in preview text.';
      } else if (lowerCh.includes('web') || lowerCh.includes('landing')) {
        concept.headline = product ? `${product}: ${objective || 'Built for results'}` : (objective || 'Campaign Landing Page');
        concept.body = `Hero-focused layout. Lead with benefit, back with proof. ${tone} tone throughout.`;
        concept.cta = 'Sign up';
        concept.notes = 'Above-fold CTA critical; minimize form fields.';
      } else if (lowerCh.includes('search') || lowerCh.includes('ppc') || lowerCh.includes('ad')) {
        concept.headline = product ? `${product} | ${objective}` : objective;
        concept.body = `Concise ad copy focusing on outcome. Match to search intent.`;
        concept.cta = 'Shop now';
        concept.notes = 'Respect character limits; use relevant keywords.';
      } else {
        concept.headline = product ? `${product}` : 'Campaign Idea';
        concept.body = `${tone} creative tailored to ${channelName}. Focus on: ${objective || 'key benefit'}.`;
        concept.cta = 'Learn more';
        concept.notes = 'Adapt asset specs to channel requirements.';
      }
      concepts.push(concept);
    }

    // Never repeat an unsupported absolute claim as established fact.
    for (const concept of concepts) {
      concept.headline = softenClaims(concept.headline);
      concept.body = softenClaims(concept.body);
      concept.cta = softenClaims(concept.cta);
      concept.notes = softenClaims(concept.notes);
    }

    // Assumptions
    const assumptions = [];
    if (!audience) assumptions.push('Audience inferred from objective/product (refine with data).');
    if (channels.length === 0) assumptions.push('Default channels suggested; confirm priorities.');
    if (!sourceNotes) assumptions.push('No source notes provided; rely on brief fields only.');
    if (sourceNotes && sourceNotes.length < 20) assumptions.push('Source notes are brief; additional proof points needed to support specific claims.');
    if (unsupportedClaims.length > 0) {
      assumptions.push(`The brief mentions "${unsupportedClaims.join('", "')}" but the supplied notes provide no evidence; the draft avoids repeating it as fact.`);
    }
    assumptions.push('Concepts are starting points, not final assets.');

    // Questions for clarification
    const questions = [];
    if (!audience) questions.push('Who exactly is the primary audience (persona, demographics, or use case)?');
    if (channels.length <= 2) questions.push('Which channels are highest priority and do they have specific specs/budgets?');
    questions.push('What proof points/assets exist (reviews, stats, images, offers)?');
    if (unsupportedClaims.length > 0) {
      questions.push(`What evidence supports the claim "${unsupportedClaims.join('", "')}"?`);
    }
    if (constraints.length === 0) questions.push('Any hard constraints (brand, legal, timing, budget) we should know?');
    if (constraints.some(c => c.toLowerCase().includes('word limit') || c.toLowerCase().includes('char'))) {
      questions.push('Can you provide exact character/word limits for each channel?');
    }
    if (audience) {
      const aud = audience.toLowerCase();
      const prod = product.toLowerCase();
      const isTeen = /teen|student|youth|gen z/.test(aud);
      const isRetiree = /retire|senior|older adult|55\+/.test(aud);
      const isFinanceOffer = /retire|pension|life insurance|mortgage/.test(prod);
      const channelsLower = channels.map(ch => ch.toLowerCase());
      const channelMismatch =
        (isTeen && channelsLower.some(ch => ch.includes('linkedin'))) ||
        (isRetiree && channelsLower.some(ch => ch.includes('tiktok')));
      const offerMismatch = (isTeen && isFinanceOffer) || (isRetiree && /student|teen|youth/.test(prod));
      if (channelMismatch) {
        questions.push('Is this channel appropriate for this audience? Consider platform demographics.');
      }
      if (offerMismatch) {
        questions.push('Does the offer fit this audience? Confirm the audience or the product before producing final assets.');
      }
    }
    questions.push('What defines success (KPI) for this campaign?');

    return {
      generatedAt: new Date().toISOString(),
      briefEcho: {
        objective, audience, product, tone, channels, constraints, sourceNotes
      },
      draft: {
        targetAudience,
        keyMessage,
        concepts,
        assumptions,
        questions
      }
    };
  } catch (err) {
    throw err;
  }
}

app.post('/api/generate', (req, res) => {
  try {
    const result = generateDraft(req.body || {});
    res.json({ ok: true, result });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message || 'Failed to generate draft' });
  }
});

app.get('/api/samples', (req, res) => {
  try {
    const samples = require('./samples/briefs.json');
    res.json({ ok: true, samples });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to load samples' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Brief-to-Creative Planner running at http://localhost:${PORT}`);
  });
}

module.exports = { app, generateDraft };
