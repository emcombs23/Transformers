const cardsContainer = document.getElementById('cards-container');

function createCard(key, value) {
  const card = document.createElement('article');
  card.className = 'card';

  const content = document.createElement('div');
  content.className = 'card-content';

  const keyEl = document.createElement('div');
  keyEl.className = 'card-key';
  keyEl.textContent = key;

  const valueEl = document.createElement('div');
  valueEl.className = 'card-value';
  valueEl.textContent = value;

  content.appendChild(keyEl);
  content.appendChild(valueEl);
  card.appendChild(content);
  return card;
}

function renderDictionary(dict) {
  cardsContainer.innerHTML = '';
  const entries = Object.entries(dict);

  if (!entries.length) {
    cardsContainer.innerHTML = '<div class="loading">No dictionary items found.</div>';
    return;
  }

  entries.forEach(([key, value]) => {
    cardsContainer.appendChild(createCard(key, value));
  });
}

async function fetchDictionary() {
  try {
    const response = await fetch('/dict');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const dict = await response.json();
    renderDictionary(dict);
  } catch (error) {
    cardsContainer.innerHTML = `<div class="error-message">Unable to load dictionary: ${error.message}</div>`;
    console.error('Fetch /dict failed', error);
  }
}

fetchDictionary();
