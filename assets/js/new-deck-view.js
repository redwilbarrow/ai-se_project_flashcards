import { decks } from "./decks.js";

const newDeckForm = document.querySelector("#new-deck-form");
const submitBtn = newDeckForm.querySelector(".new-deck-view__submit-btn");
const textAreaEl = newDeckForm.querySelector(".new-deck-view__text-input");

const hexDigits = /^[0-9a-fA-F]{6}$/;

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
  const defaultColor = "#64d583";
  const hex = String(color ?? "").replace(/^#+/, "");

  if (!hexDigits.test(hex)) {
    return defaultColor;
  }

  return `#${hex.toLowerCase()}`;
}

newDeckForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const userInput = Object.fromEntries(formData.entries());
  const jsonData = JSON.parse(userInput["new-deck-text"]);
  const deckColor = normalizeColor(userInput.color);
  const deckID = slugify(jsonData.name) + "-" + Date.now();

  const newDeck = {
    id: deckID,
    color: deckColor,
    name: jsonData.name,
    cards: jsonData.cards,
  };

  decks.push(newDeck);

  window.location.hash = `#deck/${deckID}`;
});

export { disableSubmitBtn };
