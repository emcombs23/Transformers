async function loadVocab() {
    const res = await fetch('/vocabLookup');
    if (!res.ok) {
        console.error('Failed to fetch vocabLookup', res.status);
        return;
    }
    const lookup = await res.json();
    const container = document.getElementById('vocab-container');
    container.innerHTML = '';

    // convert to array sorted by id to preserve ordering
    const items = Object.values(lookup).sort((a, b) => a.id - b.id);

    for (const item of items) {
        const card = document.createElement('div');
        card.className = 'vocab-card';

        const wordEl = document.createElement('div');
        wordEl.className = 'vocab-word';
        wordEl.textContent = item.char === ' ' ? '␣' : item.char;

        const arrow = document.createElement('div');
        arrow.className = 'vocab-arrow';
        arrow.textContent = '↓';

        const indexEl = document.createElement('div');
        indexEl.className = 'vocab-index';
        indexEl.textContent = item.id;

        const embEl = document.createElement('div');
        embEl.className = 'vocab-embedding';
        if (Array.isArray(item.embedding)) {
            embEl.textContent = '[' + item.embedding.map(n => Number(n).toFixed(3)).join(', ') + ']';
        } else {
            embEl.textContent = JSON.stringify(item.embedding);
        }

        card.append(wordEl, arrow, indexEl, embEl);
        container.appendChild(card);
    }

    plotEmbeddings(items);
    // fetch and plot position embeddings to the right
    try {
        const pres = await fetch('/positionLookup');
        if (pres.ok) {
            const plookup = await pres.json();
            const posItems = Object.values(plookup).sort((a, b) => a.id - b.id);
            plotPositions(posItems);
        } else {
            console.error('Failed to fetch positionLookup', pres.status);
        }
    } catch (err) {
        console.error('Error fetching positionLookup', err);
    }
}

async function encodeWord() {
    const input = document.getElementById('encode-input');
    const resultContainer = document.getElementById('encode-result');
    const word = input.value || '';
    resultContainer.textContent = '';

    if (word.trim() === '') {
        resultContainer.textContent = 'Please enter a word.';
        return;
    }

    try {
        const res = await fetch(`/sentenceEmbedding?string=${encodeURIComponent(word)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const list = await res.json();

        // display each embedding as formatted array
        for (const emb of list) {
            const span = document.createElement('span');
            span.className = 'encode-item';
            if (Array.isArray(emb)) {
                span.textContent = '[' + emb.map(n => Number(n).toFixed(3)).join(', ') + ']';
            } else {
                span.textContent = JSON.stringify(emb);
            }
            resultContainer.appendChild(span);
        }
    } catch (err) {
        resultContainer.textContent = 'Error encoding word.';
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('encode-button');
    const input = document.getElementById('encode-input');
    btn.addEventListener('click', encodeWord);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') encodeWord();
    });

    // initial load: fetch vocabLookup and render embeddings
    loadVocab();
});


function plotEmbeddings(items) {
    const canvas = document.getElementById('embedding-plot');
    if (!canvas) return;
    // set up for high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // clear
    ctx.clearRect(0, 0, rect.width, rect.height);

    // collect coordinates
    const coords = items.map(it => ({char: it.char, x: Number(it.embedding[0]), y: Number(it.embedding[1])}));
    if (coords.length === 0) return;

    let minX = Math.min(...coords.map(c => c.x));
    let maxX = Math.max(...coords.map(c => c.x));
    let minY = Math.min(...coords.map(c => c.y));
    let maxY = Math.max(...coords.map(c => c.y));

    // add small padding
    const pad = 0.2;
    const dx = maxX - minX || 1;
    const dy = maxY - minY || 1;
    minX -= dx * pad; maxX += dx * pad;
    minY -= dy * pad; maxY += dy * pad;

    const plotW = rect.width;
    const plotH = rect.height;

    function toPxX(x) { return ((x - minX) / (maxX - minX)) * plotW; }
    function toPxY(y) { return plotH - ((y - minY) / (maxY - minY)) * plotH; }

    // draw grid lines
    ctx.strokeStyle = '#0f3460';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // center axes
    const zeroX = (0 >= minX && 0 <= maxX) ? toPxX(0) : null;
    const zeroY = (0 >= minY && 0 <= maxY) ? toPxY(0) : null;
    if (zeroX !== null) { ctx.moveTo(zeroX, 0); ctx.lineTo(zeroX, plotH); }
    if (zeroY !== null) { ctx.moveTo(0, zeroY); ctx.lineTo(plotW, zeroY); }
    ctx.stroke();

    // draw points
    for (const p of coords) {
        const px = toPxX(p.x);
        const py = toPxY(p.y);
        // circle
        ctx.fillStyle = '#e94560';
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();

        // label
        ctx.fillStyle = '#cbd6f7';
        ctx.font = '12px sans-serif';
        const label = p.char === ' ' ? '␣' : p.char;
        ctx.fillText(label, px + 8, py + 4);
    }
}

function plotPositions(items) {
    const canvas = document.getElementById('position-plot');
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);
    const coords = items.map(it => ({id: it.id, x: Number(it.embedding[0]), y: Number(it.embedding[1])}));
    if (coords.length === 0) return;

    let minX = Math.min(...coords.map(c => c.x));
    let maxX = Math.max(...coords.map(c => c.x));
    let minY = Math.min(...coords.map(c => c.y));
    let maxY = Math.max(...coords.map(c => c.y));
    const pad = 0.2;
    const dx = maxX - minX || 1;
    const dy = maxY - minY || 1;
    minX -= dx * pad; maxX += dx * pad;
    minY -= dy * pad; maxY += dy * pad;

    const plotW = rect.width;
    const plotH = rect.height;
    function toPxX(x) { return ((x - minX) / (maxX - minX)) * plotW; }
    function toPxY(y) { return plotH - ((y - minY) / (maxY - minY)) * plotH; }

    // draw axes
    ctx.strokeStyle = '#0f3460';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const zeroX = (0 >= minX && 0 <= maxX) ? toPxX(0) : null;
    const zeroY = (0 >= minY && 0 <= maxY) ? toPxY(0) : null;
    if (zeroX !== null) { ctx.moveTo(zeroX, 0); ctx.lineTo(zeroX, plotH); }
    if (zeroY !== null) { ctx.moveTo(0, zeroY); ctx.lineTo(plotW, zeroY); }
    ctx.stroke();

    // draw points labeled with position id
    for (const p of coords) {
        const px = toPxX(p.x);
        const py = toPxY(p.y);
        ctx.fillStyle = '#36b4c8';
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#cbd6f7';
        ctx.font = '12px sans-serif';
        ctx.fillText(String(p.id), px + 8, py + 4);
    }
}