async function loadVocab() {
    const res = await fetch('/vocab');
    const vocab = await res.json();
    const container = document.getElementById('vocab-container');

    for (const [word, index] of Object.entries(vocab)) {
        const card = document.createElement('div');
        card.className = 'vocab-card';

        const wordEl = document.createElement('div');
        wordEl.className = 'vocab-word';
        wordEl.textContent = word === ' ' ? '␣' : word;

        const arrow = document.createElement('div');
        arrow.className = 'vocab-arrow';
        arrow.textContent = '↓';

        const indexEl = document.createElement('div');
        indexEl.className = 'vocab-index';
        indexEl.textContent = index;

        card.append(wordEl, arrow, indexEl);
        container.appendChild(card);
    }
}

loadVocab();

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
        const res = await fetch(`/encode?string=${encodeURIComponent(word)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const list = await res.json();

        // display items horizontally (not bulleted)
        for (const item of list) {
            const span = document.createElement('span');
            span.className = 'encode-item';
            span.textContent = item;
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
});