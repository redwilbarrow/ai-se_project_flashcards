import { fetchedDecks } from "./decks.js";
import { addDeck } from "./api.js";
import { showError } from "./modal.js";

const newDeckForm = document.querySelector("#new-deck-form");
const submitBtn = newDeckForm.querySelector(".new-deck-view__submit-btn");
const textAreaEl = newDeckForm.querySelector(".new-deck-view__text-input");

const DEFAULT_DECK_COLOR = "#64d583";
const HEX_DIGITS = /^[0-9a-fA-F]{6}$/;

/**
 * Checks whether a value is a string with non-whitespace text.
 *
 * @param {*} value - The value to validate.
 * @returns {boolean} True when the value has text after trimming whitespace.
 */
function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Validates and trims imported card data.
 *
 * @param {*} cards - The value to validate as the deck's cards array.
 * @returns {Array<object>|null} The trimmed cards, or null when any card is invalid.
 */
function validateCards(cards) {
  if (!Array.isArray(cards)) {
    return null;
  }

  const trimmedCards = cards.map((card) => {
    if (!card || !hasText(card.question) || !hasText(card.answer)) {
      return null;
    }

    return {
      ...card,
      question: card.question.trim(),
      answer: card.answer.trim(),
    };
  });

  return trimmedCards.includes(null) ? null : trimmedCards;
}

/**
 * Enables the new deck submit button when the new deck view opens.
 *
 * @returns {void}
 */
function enableSubmitBtn() {
  submitBtn.disabled = false;
}

/**
 * Converts a user-selected color value into a valid lowercase hex color.
 *
 * @param {string} color - The color value from the form.
 * @returns {string} A normalized hex color, or the default color if invalid.
 */
function normalizeColor(color) {
  const hex = String(color ?? "")
    .trim()
    .replace(/^#+/, "");

  if (!hex || !HEX_DIGITS.test(hex)) {
    return DEFAULT_DECK_COLOR;
  }

  return `#${hex.toLowerCase()}`;
}

newDeckForm.addEventListener("submit", newCardSubmitHandler);

/**
 * Validates and submits the new deck form data.
 *
 * @param {SubmitEvent} evt - The form submit event.
 * @returns {void}
 */
function newCardSubmitHandler(evt) {
  evt.preventDefault();

  const formData = new FormData(evt.target);
  const userInput = Object.fromEntries(formData.entries());

  const jsonData = parseJSON(userInput["new-deck-text"]);
  if (jsonData === null) {
    showError("Invalid JSON syntax. Please check your formatting.");
    return;
  }

  const name = validateName(jsonData.name);
  if (name === null) {
    showError("Name must be a string between 2 and 80 characters.");
    return;
  }

  const cards = validateCards(jsonData.cards);
  if (cards === null) {
    showError("Cards must be an array of cards with question and answer text.");
    return;
  }

  const deckColor = normalizeColor(userInput.color);
  const jsonColor = jsonData.color;

  if (jsonColor !== undefined && typeof jsonColor !== "string") {
    showError(
      "Deck color must be a string. Use one of: #64D583, #91A8F9, #EE92D7, #AA8EF0, #EE955E, #F5D770",
    );
    return;
  }

  if (jsonColor !== undefined && jsonColor.toLowerCase() !== deckColor) {
    showError(
      "The JSON color must match the selected deck color. Use one of: #64D583, #91A8F9, #EE92D7, #AA8EF0, #EE955E, #F5D770",
    );
    return;
  }

  const newDeck = {
    color: deckColor,
    name: name,
    cards: cards,
  };

  addDeck(newDeck)
    .then((fetchedNewDeck) => {
      /* I was running into an issue where the API is initially returning
       * `newDeck.cards` empty, so cards were not displaying. SO, I added
       * the following.
       */
      const savedDeck = {
        ...newDeck,
        ...fetchedNewDeck,
        cards:
          Array.isArray(fetchedNewDeck.cards) &&
          fetchedNewDeck.cards.length === newDeck.cards.length
            ? fetchedNewDeck.cards
            : newDeck.cards,
      };

      // Push `savedDeck`
      fetchedDecks.push(savedDeck);

      // Custom Event to tell Home view to display new deck (only way I could make this work while still following TripleTen instructions)
      window.dispatchEvent(
        new CustomEvent("deckadded", {
          detail: savedDeck,
        }),
      );

      // Clear #new-deck-text field
      textAreaEl.value = "";

      // Update hash
      window.location.hash = `#deck/${savedDeck._id}`;
    })
    .catch(showError);
}

/**
 * Validates that a deck name is a string with the required length.
 *
 * @param {*} name - The value to validate as a deck name.
 * @returns {string|null} The valid name, or null when the value is invalid.
 */
function validateName(name) {
  if (typeof name != "string" || name.length < 2 || name.length > 80) {
    return null;
  }
  return name;
}

/**
 * Safely parses a JSON string.
 *
 * @param {string} jsonString - The JSON text to parse.
 * @returns {object|null} The parsed value, or null when parsing fails.
 */
function parseJSON(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return null;
  }
}

export { enableSubmitBtn };
