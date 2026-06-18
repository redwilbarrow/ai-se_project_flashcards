import { fetchedDecks } from "./decks.js";
import { addDeck } from "./api.js";
import { showError } from "./modal.js";

const newDeckForm = document.querySelector("#new-deck-form");
const submitBtn = newDeckForm.querySelector(".new-deck-view__submit-btn");
const textAreaEl = newDeckForm.querySelector(".new-deck-view__text-input");

const DEFAULT_DECK_COLOR = "#64d583";
const HEX_DIGITS = /^[0-9a-fA-F]{6}$/;

function disableSubmitBtn() {
  submitBtn.disabled = false;
}

function slugify(str) {
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

  if (!Array.isArray(jsonData.cards)) {
    showError("Cards must be an array.");
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

  const newDeckData = {
    color: deckColor,
    name: name,
    cards: jsonData.cards,
  };

  addDeck(newDeckData)
    .then((newDeck) => {
      /* Was running into an issue where the API is initially returning
       ** `newDeck.cards` empty, so cards were not displaying. SO, I added
       ** the following.
       */
      const savedDeck = {
        ...newDeckData,
        ...newDeck,
        cards:
          Array.isArray(newDeck.cards) && newDeck.cards.length > 0
            ? newDeck.cards
            : newDeckData.cards,
      };

      // Push `savedDeck`
      fetchedDecks.push(savedDeck);

      // Clear #new-deck-text field
      textAreaEl.value = "";

      // Update hash
      window.location.hash = `#deck/${newDeck._id}`;
    })
    .catch(showError);
}

function validateName(name) {
  if (typeof name != "string" || name.length < 2 || name.length > 80) {
    return null;
  }
  return name;
}

function parseJSON(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return null;
  }
}

export { disableSubmitBtn };
