const baseUrl = "https://se-flashcards-api.en.tripleten-services.com/v1";
const decksUrl = `${baseUrl}/decks`;
const cardsUrl = `${baseUrl}/cards`;
const headers = {
  "Content-Type": "application/json",
  Authorization: "019ecb17-6d1a-70ab-be2c-fdca3f4b8daf",
};

function processResponse(res) {
  if (res.ok) {
    return res.json();
  }
  return Promise.reject(`Error: ${res.status}`);
}

function getDecks() {
  return fetch(decksUrl, { headers }).then(processResponse);
}

function deleteDeck(id) {
  return fetch(`${decksUrl}/${id}`, {
    method: "DELETE",
    headers,
  }).then(processResponse);
}

function addDeck({ name, color, cards }) {
  return fetch(decksUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name,
      color,
      cards,
    }),
  }).then(processResponse);
}

function deleteCard(id) {
  return fetch(`${cardsUrl}/${id}`, {
    method: "DELETE",
    headers,
  }).then(processResponse);
}

export { getDecks, deleteDeck, addDeck, deleteCard };
