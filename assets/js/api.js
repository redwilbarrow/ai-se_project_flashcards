const baseUrl = "https://se-flashcards-api.en.tripleten-services.com/v1";
const decksUrl = `${baseUrl}/decks`;
const cardsUrl = `${baseUrl}/cards`;
const headers = {
  "Content-Type": "application/json",
  Authorization: "019ecb17-6d1a-70ab-be2c-fdca3f4b8daf",
};

/**
 * Converts a successful API response to JSON or rejects with the status code.
 *
 * @param {Response} res - The fetch response to process.
 * @returns {Promise<object|Array>} The parsed response body.
 */
function processResponse(res) {
  if (res.ok) {
    return res.json();
  }
  return Promise.reject(`Error: ${res.status}`);
}

/**
 * Requests all decks from the API.
 *
 * @returns {Promise<Array>} The saved deck list.
 */
function getDecks() {
  return fetch(decksUrl, { headers }).then(processResponse);
}

/**
 * Deletes a deck by ID.
 *
 * @param {string} id - The deck ID to delete.
 * @returns {Promise<object>} The API deletion response.
 */
function deleteDeck(id) {
  return fetch(`${decksUrl}/${id}`, {
    method: "DELETE",
    headers,
  }).then(processResponse);
}

/**
 * Creates a new deck.
 *
 * @param {object} deckData - The deck data to save.
 * @param {string} deckData.name - The deck name.
 * @param {string} deckData.color - The deck color hex value.
 * @param {Array<object>} deckData.cards - The deck's initial cards.
 * @returns {Promise<object>} The saved deck returned by the API.
 */
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

/**
 * Deletes a card by ID.
 *
 * @param {string} id - The card ID to delete.
 * @returns {Promise<object>} The API deletion response.
 */
function deleteCard(id) {
  return fetch(`${cardsUrl}/${id}`, {
    method: "DELETE",
    headers,
  }).then(processResponse);
}

/**
 * Adds a card to a deck.
 *
 * @param {string} deckID - The ID of the deck that will receive the card.
 * @param {object} cardData - The card data to save.
 * @param {string} cardData.question - The card question text.
 * @param {string} cardData.answer - The card answer text.
 * @returns {Promise<object>} The saved card returned by the API.
 */
function addCard(deckID, { question, answer }) {
  return fetch(`${cardsUrl}/${deckID}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ question, answer }),
  }).then(processResponse);
}

/**
 * Updates an existing card.
 *
 * @param {string} cardID - The ID of the card to update.
 * @param {object} cardData - The updated card data.
 * @param {string} cardData.question - The updated question text.
 * @param {string} cardData.answer - The updated answer text.
 * @returns {Promise<object>} The updated card returned by the API.
 */
function editCard(cardID, { question, answer }) {
  return fetch(`${cardsUrl}/${cardID}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ question, answer }),
  }).then(processResponse);
}

export { getDecks, deleteDeck, addDeck, deleteCard, addCard, editCard };
