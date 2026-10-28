// Load samples
async function loadSamples() {
    try {
        const response = await fetch('/api/samples');
        const data = await response.json();
        if (data.ok) {
            window.samplesData = data.samples;
        }
    } catch (err) {
        console.error('Failed to load samples:', err);
    }
}

// Fill form with sample data
function fillSample(sampleKey) {
    const samples = window.samplesData || {};
    const sample = samples[sampleKey];
    if (!sample) return;

    document.getElementById('objective').value = sample.objective || '';
    document.getElementById('audience').value = sample.audience || '';
    document.getElementById('product').value = sample.product || '';
    document.getElementById('tone').value = sample.tone || '';
    document.getElementById('channels').value = Array.isArray(sample.channels) ? sample.channels.join(', ') : (sample.channels || '');
    document.getElementById('constraints').value = Array.isArray(sample.constraints) ? sample.constraints.join('\n') : (sample.constraints || '');
    document.getElementById('sourceNotes').value = sample.sourceNotes || sample.notes || '';
    
    // Hide previous generated draft when switching samples
    document.getElementById('draftSection').style.display = 'none';
    document.getElementById('errorSection').style.display = 'none';
    
    // Scroll to form
    document.querySelector('.brief-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Handle form submission
document.getElementById('briefForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Hide previous results
    document.getElementById('errorSection').style.display = 'none';
    document.getElementById('draftSection').style.display = 'none';
    
    // Collect form data
    const formData = {
        objective: document.getElementById('objective').value,
        audience: document.getElementById('audience').value,
        product: document.getElementById('product').value,
        tone: document.getElementById('tone').value,
        channels: document.getElementById('channels').value,
        constraints: document.getElementById('constraints').value,
        sourceNotes: document.getElementById('sourceNotes').value
    };
    
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.ok) {
            displayDraft(data.result);
        } else {
            showError(data.error || 'Failed to generate draft');
        }
    } catch (err) {
        showError('Network error: ' + err.message);
    }
});

// Show error
function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorSection').style.display = 'block';
    document.getElementById('errorSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Display draft
function displayDraft(result) {
    const { briefEcho, draft, generatedAt } = result;
    
    // Set timestamp
    document.getElementById('generatedAt').textContent = new Date(generatedAt).toLocaleString();
    
    // Set editable fields
    document.getElementById('draftTargetAudience').value = draft.targetAudience || '';
    document.getElementById('draftKeyMessage').value = draft.keyMessage || '';
    
    // Display concepts
    const conceptsContainer = document.getElementById('conceptsContainer');
    conceptsContainer.innerHTML = '';
    if (draft.concepts && draft.concepts.length > 0) {
        draft.concepts.forEach((concept, idx) => {
            const conceptDiv = document.createElement('div');
            conceptDiv.className = 'concept-card';
            conceptDiv.innerHTML = `
                <h4>${escapeHtml(concept.channel)}</h4>
                <div class="concept-field">
                    <label>Headline</label>
                    <input type="text" value="${escapeHtml(concept.headline)}" data-concept="${idx}" data-field="headline">
                </div>
                <div class="concept-field">
                    <label>Body</label>
                    <textarea rows="2" data-concept="${idx}" data-field="body">${escapeHtml(concept.body)}</textarea>
                </div>
                <div class="concept-field">
                    <label>CTA</label>
                    <input type="text" value="${escapeHtml(concept.cta)}" data-concept="${idx}" data-field="cta">
                </div>
                <div class="concept-field">
                    <label>Notes</label>
                    <textarea rows="2" data-concept="${idx}" data-field="notes">${escapeHtml(concept.notes)}</textarea>
                </div>
            `;
            conceptsContainer.appendChild(conceptDiv);
        });
    }
    
    // Display assumptions
    const assumptionsList = document.getElementById('assumptionsList');
    assumptionsList.innerHTML = '';
    if (draft.assumptions && draft.assumptions.length > 0) {
        draft.assumptions.forEach((assumption, idx) => {
            const li = document.createElement('li');
            li.innerHTML = `<input type="text" value="${escapeHtml(assumption)}" data-assumption="${idx}">`;
            assumptionsList.appendChild(li);
        });
    }
    
    // Display questions
    const questionsList = document.getElementById('questionsList');
    questionsList.innerHTML = '';
    if (draft.questions && draft.questions.length > 0) {
        draft.questions.forEach((question, idx) => {
            const li = document.createElement('li');
            li.innerHTML = `<input type="text" value="${escapeHtml(question)}" data-question="${idx}">`;
            questionsList.appendChild(li);
        });
    }
    
    // Display preserved constraints
    const constraintsEchoList = document.getElementById('constraintsEchoList');
    constraintsEchoList.innerHTML = '';
    if (briefEcho.constraints && briefEcho.constraints.length > 0) {
        briefEcho.constraints.forEach(constraint => {
            const li = document.createElement('li');
            li.textContent = constraint;
            constraintsEchoList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'No constraints specified';
        li.style.fontStyle = 'italic';
        li.style.color = '#666';
        constraintsEchoList.appendChild(li);
    }
    
    // Show draft section
    document.getElementById('draftSection').style.display = 'block';
    document.getElementById('draftSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Collect current draft data from UI
function collectCurrentDraft() {
    const draft = {
        generatedAt: document.getElementById('generatedAt').textContent ? new Date().toISOString() : new Date().toISOString(),
        targetAudience: document.getElementById('draftTargetAudience').value,
        keyMessage: document.getElementById('draftKeyMessage').value,
        concepts: [],
        assumptions: [],
        questions: [],
        constraints: []
    };
    
    // Collect concepts
    const conceptCards = document.querySelectorAll('.concept-card');
    conceptCards.forEach(card => {
        const channel = card.querySelector('h4').textContent;
        const headline = card.querySelector('input[data-field="headline"]').value;
        const body = card.querySelector('textarea[data-field="body"]').value;
        const cta = card.querySelector('input[data-field="cta"]').value;
        const notes = card.querySelector('textarea[data-field="notes"]').value;
        draft.concepts.push({ channel, headline, body, cta, notes });
    });
    
    // Collect assumptions
    const assumptionInputs = document.querySelectorAll('#assumptionsList input');
    assumptionInputs.forEach(input => {
        if (input.value.trim()) draft.assumptions.push(input.value);
    });
    
    // Collect questions
    const questionInputs = document.querySelectorAll('#questionsList input');
    questionInputs.forEach(input => {
        if (input.value.trim()) draft.questions.push(input.value);
    });
    
    // Collect constraints
    const constraintItems = document.querySelectorAll('#constraintsEchoList li');
    constraintItems.forEach(li => {
        const text = li.textContent;
        if (text && text !== 'No constraints specified') {
            draft.constraints.push(text);
        }
    });
    
    return draft;
}

// Export as JSON
function exportAsJson() {
    const draft = collectCurrentDraft();
    const dataStr = JSON.stringify(draft, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creative-draft-${Date.now()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Export as Markdown
function exportAsMarkdown() {
    const draft = collectCurrentDraft();
    let md = '# Creative Draft\n\n';
    md += `*Generated: ${new Date().toLocaleString()}*\n\n`;
    
    md += '## Target Audience\n';
    md += draft.targetAudience + '\n\n';
    
    md += '## Key Message\n';
    md += draft.keyMessage + '\n\n';
    
    md += '## Concepts by Channel\n\n';
    draft.concepts.forEach(concept => {
        md += `### ${concept.channel}\n`;
        md += `**Headline:** ${concept.headline}\n\n`;
        md += `**Body:** ${concept.body}\n\n`;
        md += `**CTA:** ${concept.cta}\n\n`;
        if (concept.notes) {
            md += `**Notes:** ${concept.notes}\n\n`;
        }
    });
    
    md += '## Assumptions\n';
    draft.assumptions.forEach(a => {
        md += `- ${a}\n`;
    });
    md += '\n';
    
    md += '## Questions to Clarify\n';
    draft.questions.forEach(q => {
        md += `- ${q}\n`;
    });
    md += '\n';
    
    if (draft.constraints.length > 0) {
        md += '## Preserved Constraints\n';
        draft.constraints.forEach(c => {
            md += `- ${c}\n`;
        });
        md += '\n';
    }
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creative-draft-${Date.now()}.md`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Export as Text
function exportAsText() {
    const draft = collectCurrentDraft();
    let txt = 'CREATIVE DRAFT\n';
    txt += '='.repeat(50) + '\n';
    txt += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    txt += 'TARGET AUDIENCE\n';
    txt += '-'.repeat(20) + '\n';
    txt += draft.targetAudience + '\n\n';
    
    txt += 'KEY MESSAGE\n';
    txt += '-'.repeat(20) + '\n';
    txt += draft.keyMessage + '\n\n';
    
    txt += 'CONCEPTS BY CHANNEL\n';
    txt += '-'.repeat(20) + '\n\n';
    draft.concepts.forEach(concept => {
        txt += `${concept.channel.toUpperCase()}\n`;
        txt += `Headline: ${concept.headline}\n`;
        txt += `Body: ${concept.body}\n`;
        txt += `CTA: ${concept.cta}\n`;
        if (concept.notes) {
            txt += `Notes: ${concept.notes}\n`;
        }
        txt += '\n';
    });
    
    txt += 'ASSUMPTIONS\n';
    txt += '-'.repeat(20) + '\n';
    draft.assumptions.forEach(a => {
        txt += `• ${a}\n`;
    });
    txt += '\n';
    
    txt += 'QUESTIONS TO CLARIFY\n';
    txt += '-'.repeat(20) + '\n';
    draft.questions.forEach(q => {
        txt += `• ${q}\n`;
    });
    txt += '\n';
    
    if (draft.constraints.length > 0) {
        txt += 'PRESERVED CONSTRAINTS\n';
        txt += '-'.repeat(20) + '\n';
        draft.constraints.forEach(c => {
            txt += `• ${c}\n`;
        });
        txt += '\n';
    }
    
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creative-draft-${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Copy to clipboard
async function copyToClipboard() {
    const draft = collectCurrentDraft();
    let txt = 'CREATIVE DRAFT\n\n';
    txt += `Target Audience: ${draft.targetAudience}\n\n`;
    txt += `Key Message: ${draft.keyMessage}\n\n`;
    txt += 'Concepts:\n';
    draft.concepts.forEach(concept => {
        txt += `  ${concept.channel}: ${concept.headline} - ${concept.cta}\n`;
    });
    txt += '\nAssumptions:\n';
    draft.assumptions.forEach(a => {
        txt += `  - ${a}\n`;
    });
    txt += '\nQuestions:\n';
    draft.questions.forEach(q => {
        txt += `  - ${q}\n`;
    });
    
    try {
        await navigator.clipboard.writeText(txt);
        const btn = document.getElementById('copyBtn');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    } catch (err) {
        alert('Failed to copy to clipboard');
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event listeners for sample buttons
document.addEventListener('DOMContentLoaded', () => {
    loadSamples();
    
    const sampleBtns = document.querySelectorAll('.sample-btn');
    sampleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            fillSample(btn.dataset.sample);
        });
    });
    
    // Export buttons
    document.getElementById('exportJsonBtn').addEventListener('click', exportAsJson);
    document.getElementById('exportMdBtn').addEventListener('click', exportAsMarkdown);
    document.getElementById('exportTxtBtn').addEventListener('click', exportAsText);
    document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
});
