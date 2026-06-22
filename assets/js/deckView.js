import { hexToString, removeColorClasses } from "./colorMap.js";
import { openConfirmationModal, showError } from "./modal.js";
import { addCard, deleteCard, editCard } from "./api.js";
import {
  clearCardEditor,
  openEditCardEditor,
  openNewCardEditor,
  sideNames,
} from "./cardEditor.js";

const deckViewSection = document.querySelector("#deck-view");
const deckTitleEl = deckViewSection.querySelector(".gallery__title");
const practiceBtn = deckViewSection.querySelector(".gallery__practice-btn");
const flashcardTemplateEl = document.querySelector("#flashcard-template");
const flashcardContainerEl = deckViewSection.querySelector(".gallery__list");
const newCardBtn = deckViewSection.querySelector(
  ".gallery__new-card-btn_location_deck-view",
);
const modalEl = document.querySelector("#modal");

let currentDeck = null;

/**
 * @typedef {import("./cardEditor.js").CardSide} CardSide
 */

/**
 * @typedef {import("./cardEditor.js").CardValues} CardValues
 */

/**
 * Builds the card color class for the current deck.
 *
 * @returns {string|null} The card color modifier class, or null for the default color.
 */
function getDeckColorClass() {
  const deckColor = hexToString(currentDeck.color);
  return deckColor && deckColor !== "default"
    ? `card_color_${deckColor}`
    : null;
}

/**
 * Applies the current deck color to a card element.
 *
 * @param {HTMLElement} cardEl - The card element to color.
 * @returns {void}
 */
function applyDeckColor(cardEl) {
  const deckColorClass = getDeckColorClass();

  if (deckColorClass) {
    removeColorClasses(cardEl);
    cardEl.classList.add(deckColorClass);
  }
}

/**
 * Finds the index of a card inside the current deck.
 *
 * @param {string} cardID - The card ID to find.
 * @returns {number} The card index, or -1 when the card is not found.
 */
function getCardIndex(cardID) {
  return currentDeck.cards.findIndex((card) => card._id === cardID);
}

/**
 * Replaces a card in the current deck with its updated data.
 *
 * @param {object} updatedCard - The updated card returned by the API.
 * @param {string} updatedCard._id - The ID of the card to replace.
 * @returns {void}
 */
function replaceDeckCard(updatedCard) {
  const cardIndex = getCardIndex(updatedCard._id);

  if (cardIndex !== -1) {
    currentDeck.cards.splice(cardIndex, 1, updatedCard);
  }
}

/**
 * Opens the confirmation modal used before discarding unsaved card changes.
 *
 * @param {object} options - The discard modal options.
 * @param {string} options.title - The modal title.
 * @param {string} options.message - The modal message.
 * @param {() => void} options.onConfirm - The callback to run when discard is confirmed.
 * @returns {void}
 */
function openDiscardModal({ title, message, onConfirm }) {
  openConfirmationModal({
    title,
    message,
    confirmText: "Discard",
    cancelText: "Keep editing",
    onConfirm,
  });
}

/**
 * Checks whether the reusable modal is currently visible.
 *
 * @returns {boolean} True when the modal is visible.
 */
function isModalOpen() {
  return modalEl.classList.contains("modal_visible");
}

/**
 * Saves a new card through the API and stores it in the current deck.
 *
 * @param {CardValues} values - The card values to save.
 * @returns {Promise<object>} The saved card returned by the API.
 */
function saveNewCard(values) {
  return addCard(currentDeck._id, values).then((newCard) => {
    currentDeck.cards.push(newCard);
    return newCard;
  });
}

/**
 * Saves edited card values through the API and updates the current deck.
 *
 * @param {object} cardData - The saved card data being edited.
 * @param {string} cardData._id - The ID of the card to edit.
 * @param {CardValues} values - The updated card values.
 * @returns {Promise<object>} The updated saved card data.
 */
function saveEditedCard(cardData, values) {
  return editCard(cardData._id, values).then((updatedCard) => {
    const savedCardData = { ...cardData, ...updatedCard };
    replaceDeckCard(savedCardData);
    return savedCardData;
  });
}

/**
 * Creates a saved card element with flip, edit, and delete behavior.
 *
 * @param {object} cardData - The saved card data to render.
 * @param {string} cardData._id - The card ID.
 * @param {string} cardData.question - The card question text.
 * @param {string} cardData.answer - The card answer text.
 * @param {CardSide} [initialSide=sideNames.question] - The side to show first.
 * @returns {HTMLElement} The configured saved card element.
 */
function createSavedCardEl(cardData, initialSide = sideNames.question) {
  const flashcardEl = flashcardTemplateEl.content
    .querySelector(".card")
    .cloneNode(true);

  const flashcardTextEl = flashcardEl.querySelector(".card__title");

  let showingQuestion = initialSide === sideNames.question;

  applyDeckColor(flashcardEl);

  const flipBtn = flashcardEl.querySelector(".card__flip-btn");

  /**
   * Updates the saved card text and visual side.
   *
   * @returns {void}
   */
  function updateDisplay() {
    if (showingQuestion) {
      flashcardTextEl.textContent = cardData.question;
      flashcardEl.classList.remove("card_color_white");
      flashcardTextEl.classList.remove("card__title_showing-answer");
    } else {
      flashcardTextEl.textContent = cardData.answer;
      flashcardEl.classList.add("card_color_white");
      flashcardTextEl.classList.add("card__title_showing-answer");
    }
  }

  flipBtn.addEventListener("click", () => {
    showingQuestion = !showingQuestion;
    updateDisplay();
  });

  const editBtn = flashcardEl.querySelector(".card__edit-btn");
  editBtn.addEventListener("click", () => {
    openEditCardEditor({
      cardData,
      savedCardEl: flashcardEl,
      initialSide: showingQuestion ? sideNames.question : sideNames.answer,
      applyCardColor: applyDeckColor,
      createSavedCardEl,
      saveCard: saveEditedCard,
      requestDiscard: openDiscardModal,
      isModalOpen,
      onError: showError,
    });
  });

  const deleteBtn = flashcardEl.querySelector(".card__delete-btn");

  deleteBtn.addEventListener("click", () => {
    openConfirmationModal("card", () => {
      deleteCard(cardData._id)
        .then(() => {
          flashcardEl.remove();

          const cardIndex = getCardIndex(cardData._id);

          if (cardIndex !== -1) {
            currentDeck.cards.splice(cardIndex, 1);
          }
        })
        .catch(() => {
          showError("Error deleting card");
        });
    });
  });

  updateDisplay();

  return flashcardEl;
}

/**
 * Renders one saved card into the deck view list.
 *
 * @param {object} cardData - The saved card data to render.
 * @param {CardSide} [initialSide=sideNames.question] - The side to show first.
 * @returns {void}
 */
function renderSavedCard(cardData, initialSide = sideNames.question) {
  const flashcardEl = createSavedCardEl(cardData, initialSide);
  flashcardContainerEl.append(flashcardEl);
}

/**
 * Opens a blank form card for creating a new card.
 *
 * @returns {void}
 */
function openNewCardForm() {
  openNewCardEditor({
    containerEl: flashcardContainerEl,
    applyCardColor: applyDeckColor,
    createSavedCardEl,
    saveCard: saveNewCard,
    requestDiscard: openDiscardModal,
    isModalOpen,
    onOpen: () => {
      newCardBtn.hidden = true;
    },
    onClose: () => {
      newCardBtn.hidden = false;
    },
    onError: showError,
  });
}

practiceBtn.addEventListener("click", () => {
  if (currentDeck) {
    window.location.hash = `#carousel/${currentDeck._id}`;
  }
});

newCardBtn.addEventListener("click", openNewCardForm);

/**
 * Renders the deck detail view for one deck.
 *
 * @param {object} deck - The deck to render.
 * @param {string} deck.name - The deck name.
 * @param {Array<object>} deck.cards - The deck's cards.
 * @returns {void}
 */
function renderDeckView(deck) {
  clearCardEditor();
  currentDeck = deck;
  newCardBtn.hidden = false;

  flashcardContainerEl.innerHTML = "";

  deckTitleEl.textContent = deck.name;

  deck.cards.forEach((cardData) => renderSavedCard(cardData));
}

export { renderDeckView };
