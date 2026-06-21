import { hexToString, removeColorClasses } from "./colorMap.js";
import { openConfirmationModal, showError } from "./modal.js";
import { addCard, deleteCard, editCard } from "./api.js";

const deckViewSection = document.querySelector("#deck-view");
const deckTitleEl = deckViewSection.querySelector(".gallery__title");
const practiceBtn = deckViewSection.querySelector(".gallery__practice-btn");
const flashcardTemplateEl = document.querySelector("#flashcard-template");
const flashcardFormTemplateEl = document.querySelector(
  "#flashcard-form-template",
);
const flashcardContainerEl = deckViewSection.querySelector(".gallery__list");
const galleryWrapperEl = deckViewSection.querySelector(
  ".gallery__grid-wrapper",
);
const newCardBtn = deckViewSection.querySelector(
  ".gallery__new-card-btn_location_deck-view",
);
const modalEl = document.querySelector("#modal");

let currentDeck = null;
let activeEditor = null;

const sideNames = {
  question: "question",
  answer: "answer",
};

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
 * Removes document listeners used by the active card editor.
 *
 * @returns {void}
 */
function clearActiveEditorListeners() {
  document.removeEventListener("keydown", handleEditorEscClose);
  document.removeEventListener("mousedown", handleEditorOutsideClick);
}

/**
 * Sets the active card editor and attaches its close listeners.
 *
 * @param {object} editor - The card editor state object.
 * @returns {void}
 */
function setActiveEditor(editor) {
  clearActiveEditorListeners();
  activeEditor = editor;
  document.addEventListener("keydown", handleEditorEscClose);
  document.addEventListener("mousedown", handleEditorOutsideClick);
}

/**
 * Clears the active card editor and removes its close listeners.
 *
 * @returns {void}
 */
function clearActiveEditor() {
  clearActiveEditorListeners();
  activeEditor = null;
}

/**
 * Opens the confirmation modal used before discarding unsaved card changes.
 *
 * @param {object} options - The discard modal options.
 * @param {string} options.title - The modal title.
 * @param {string} options.message - The modal message.
 * @param {Function} options.onConfirm - The callback to run when discard is confirmed.
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
 * Focuses the field for the editor's active side.
 *
 * @param {object} editor - The card editor state object.
 * @returns {void}
 */
function focusActiveField(editor) {
  const activeField = editor.el.querySelector(
    `.card__field_type_${editor.side}`,
  );

  activeField.focus();
}

/**
 * Copies the active field's current value into editor state.
 *
 * @param {object} editor - The card editor state object.
 * @returns {void}
 */
function syncEditorValue(editor) {
  const activeField = editor.el.querySelector(
    `.card__field_type_${editor.side}`,
  );

  editor.values[editor.side] = activeField.value;
}

/**
 * Switches the form card between question and answer editing sides.
 *
 * @param {object} editor - The card editor state object.
 * @param {string} side - The side to show, either question or answer.
 * @returns {void}
 */
function updateFormSide(editor, side) {
  editor.side = side;
  editor.el.classList.toggle(
    "card_state_question-editing",
    side === sideNames.question,
  );
  editor.el.classList.toggle(
    "card_state_answer-editing",
    side === sideNames.answer,
  );
  editor.el.classList.toggle("card_color_white", side === sideNames.answer);

  const questionField = editor.el.querySelector(".card__field_type_question");
  const answerField = editor.el.querySelector(".card__field_type_answer");
  questionField.value = editor.values.question;
  answerField.value = editor.values.answer;
  answerField.placeholder = editor.answerPlaceholder;

  updateSaveButton(editor);
}

/**
 * Enables or disables the save button for the editor's active side.
 *
 * @param {object} editor - The card editor state object.
 * @returns {void}
 */
function updateSaveButton(editor) {
  const saveBtn = editor.el.querySelector(".card__save-btn");
  const currentValue = editor.values[editor.side].trim();

  if (editor.side === sideNames.question) {
    saveBtn.disabled = currentValue.length === 0;
    return;
  }

  saveBtn.disabled = false;
}

/**
 * Creates and wires a form card element for adding or editing a card.
 *
 * @param {object} editor - The card editor state object.
 * @returns {HTMLElement} The configured form card element.
 */
function createFormCardEl(editor) {
  const formCardEl = flashcardFormTemplateEl.content
    .querySelector(".card")
    .cloneNode(true);

  applyDeckColor(formCardEl);
  formCardEl.classList.toggle(
    "card_state_editing-saved",
    editor.mode === "edit",
  );

  editor.el = formCardEl;

  const formEl = formCardEl.querySelector(".card__form");
  const questionField = formCardEl.querySelector(".card__field_type_question");
  const answerField = formCardEl.querySelector(".card__field_type_answer");
  const flipBtn = formCardEl.querySelector(".card__flip-btn");

  questionField.value = editor.values.question;
  answerField.value = editor.values.answer;
  questionField.placeholder = "Type the question or term";
  answerField.placeholder = editor.answerPlaceholder;

  questionField.addEventListener("input", () => {
    editor.values.question = questionField.value;
    editor.confirmed.question = false;
    updateSaveButton(editor);
  });

  answerField.addEventListener("input", () => {
    editor.values.answer = answerField.value;
    editor.confirmed.answer = false;
    editor.answerPlaceholder = "Type the answer or definition";
    answerField.placeholder = editor.answerPlaceholder;
    updateSaveButton(editor);
  });

  flipBtn.addEventListener("click", () => {
    syncEditorValue(editor);
    updateFormSide(
      editor,
      editor.side === sideNames.question
        ? sideNames.answer
        : sideNames.question,
    );
    focusActiveField(editor);
  });

  formEl.addEventListener("submit", (evt) => {
    evt.preventDefault();
    handleFormSave(editor);
  });

  updateFormSide(editor, editor.side);

  return formCardEl;
}

/**
 * Creates a saved card element with flip, edit, and delete behavior.
 *
 * @param {object} cardData - The saved card data to render.
 * @param {string} cardData._id - The card ID.
 * @param {string} cardData.question - The card question text.
 * @param {string} cardData.answer - The card answer text.
 * @param {string} [initialSide=sideNames.question] - The side to show first.
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
    openEditCardForm(cardData, flashcardEl, showingQuestion);
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
 * @param {string} [initialSide=sideNames.question] - The side to show first.
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
  if (activeEditor) {
    attemptCloseActiveEditor();
    return;
  }

  const editor = {
    mode: "new",
    side: sideNames.question,
    values: { question: "", answer: "" },
    confirmed: { question: false, answer: false },
    answerPlaceholder: "Type the answer or definition",
  };

  const formCardEl = createFormCardEl(editor);
  flashcardContainerEl.append(formCardEl);
  newCardBtn.hidden = true;
  setActiveEditor(editor);
  focusActiveField(editor);
}

/**
 * Replaces a saved card with an edit form for that card.
 *
 * @param {object} cardData - The saved card data to edit.
 * @param {HTMLElement} savedCardEl - The saved card element being replaced.
 * @param {boolean} showingQuestion - Whether the saved card is currently showing its question side.
 * @returns {void}
 */
function openEditCardForm(cardData, savedCardEl, showingQuestion) {
  if (activeEditor) {
    attemptCloseActiveEditor();
    return;
  }

  const side = showingQuestion ? sideNames.question : sideNames.answer;
  const editor = {
    mode: "edit",
    side,
    cardData,
    savedCardEl,
    values: {
      question: cardData.question,
      answer: cardData.answer || "",
    },
    confirmed: { question: false, answer: false },
    originalValues: {
      question: cardData.question,
      answer: cardData.answer || "",
    },
    answerPlaceholder: cardData.answer
      ? "Type the answer or definition"
      : "No answer provided",
  };

  const formCardEl = createFormCardEl(editor);
  savedCardEl.replaceWith(formCardEl);
  setActiveEditor(editor);
  focusActiveField(editor);
}

/**
 * Handles a form card save attempt for either a new or existing card.
 *
 * @param {object} editor - The card editor state object.
 * @returns {void}
 */
function handleFormSave(editor) {
  syncEditorValue(editor);

  if (editor.side === sideNames.question && !editor.values.question.trim()) {
    updateSaveButton(editor);
    return;
  }

  if (editor.mode === "new") {
    handleNewCardSideSave(editor);
    return;
  }

  handleEditCardSave(editor);
}

/**
 * Saves each side of a new card and posts the card after both sides are confirmed.
 *
 * @param {object} editor - The new card editor state object.
 * @returns {void}
 */
function handleNewCardSideSave(editor) {
  editor.confirmed[editor.side] = true;

  if (editor.side === sideNames.answer && !editor.values.answer) {
    editor.answerPlaceholder = "No answer was provided";
  }

  const otherSide =
    editor.side === sideNames.question ? sideNames.answer : sideNames.question;

  if (!editor.confirmed[otherSide]) {
    updateFormSide(editor, otherSide);
    focusActiveField(editor);
    return;
  }

  const saveBtn = editor.el.querySelector(".card__save-btn");
  saveBtn.disabled = true;

  addCard(currentDeck._id, {
    question: editor.values.question.trim(),
    answer: editor.values.answer,
  })
    .then((newCard) => {
      currentDeck.cards.push(newCard);
      const savedCardEl = createSavedCardEl(newCard);
      editor.el.replaceWith(savedCardEl);
      newCardBtn.hidden = false;
      clearActiveEditor();
    })
    .catch(() => {
      updateSaveButton(editor);
      showError("Error adding card");
    });
}

/**
 * Sends edited card values to the API and renders the updated saved card.
 *
 * @param {object} editor - The edit card editor state object.
 * @returns {void}
 */
function handleEditCardSave(editor) {
  const updatedValues = {
    question: editor.values.question.trim(),
    answer: editor.values.answer,
  };
  const saveBtn = editor.el.querySelector(".card__save-btn");
  saveBtn.disabled = true;

  editCard(editor.cardData._id, updatedValues)
    .then((updatedCard) => {
      const savedCardData = { ...editor.cardData, ...updatedCard };
      replaceDeckCard(savedCardData);
      const savedCardEl = createSavedCardEl(savedCardData, editor.side);
      editor.el.replaceWith(savedCardEl);
      clearActiveEditor();
    })
    .catch(() => {
      updateSaveButton(editor);
      showError("Error editing card");
    });
}

/**
 * Restores the original saved card element after canceling an edit.
 *
 * @param {object} editor - The edit card editor state object.
 * @returns {void}
 */
function restoreEditedCard(editor) {
  const savedCardEl = createSavedCardEl(editor.cardData, editor.side);
  editor.el.replaceWith(savedCardEl);
  clearActiveEditor();
}

/**
 * Removes an unsaved new card form and restores the new card button.
 *
 * @param {object} editor - The new card editor state object.
 * @returns {void}
 */
function cancelNewCard(editor) {
  editor.el.remove();
  newCardBtn.hidden = false;
  clearActiveEditor();
}

/**
 * Checks whether an edited card has unsaved changes.
 *
 * @param {object} editor - The edit card editor state object.
 * @returns {boolean} True when the current values differ from the original values.
 */
function hasEditChanges(editor) {
  syncEditorValue(editor);

  return (
    editor.values.question !== editor.originalValues.question ||
    editor.values.answer !== editor.originalValues.answer
  );
}

/**
 * Checks whether a new card form has any draft text.
 *
 * @param {object} editor - The new card editor state object.
 * @returns {boolean} True when either side of the new card contains text.
 */
function hasNewCardDraft(editor) {
  syncEditorValue(editor);

  return (
    editor.values.question.trim().length > 0 ||
    editor.values.answer.trim().length > 0
  );
}

/**
 * Attempts to close the active editor, asking for confirmation when needed.
 *
 * @returns {void}
 */
function attemptCloseActiveEditor() {
  if (!activeEditor) {
    return;
  }

  const editor = activeEditor;

  if (editor.mode === "new") {
    if (!hasNewCardDraft(editor)) {
      cancelNewCard(editor);
      return;
    }

    openDiscardModal({
      title: "Cancel new card?",
      message:
        "This card has not been saved yet. If you cancel now, the new card will be discarded.",
      onConfirm: () => cancelNewCard(editor),
    });
    return;
  }

  if (!hasEditChanges(editor)) {
    restoreEditedCard(editor);
    return;
  }

  openDiscardModal({
    title: "Discard changes?",
    message:
      "You have unsaved changes on this card. If you discard them, the card will return to its last saved version.",
    onConfirm: () => restoreEditedCard(editor),
  });
}

/**
 * Attempts to close the active editor when Escape is pressed.
 *
 * @param {KeyboardEvent} evt - The keydown event.
 * @returns {void}
 */
function handleEditorEscClose(evt) {
  if (modalEl.classList.contains("modal_visible")) {
    return;
  }

  if (evt.key !== "Escape") {
    return;
  }

  attemptCloseActiveEditor();
}

/**
 * Attempts to close the active editor after a click outside the editor.
 *
 * @param {MouseEvent} evt - The mousedown event.
 * @returns {void}
 */
function handleEditorOutsideClick(evt) {
  if (modalEl.classList.contains("modal_visible")) {
    return;
  }

  if (!activeEditor || activeEditor.el.contains(evt.target)) {
    return;
  }

  attemptCloseActiveEditor();
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
  clearActiveEditor();
  currentDeck = deck;
  newCardBtn.hidden = false;

  flashcardContainerEl.innerHTML = "";

  deckTitleEl.textContent = deck.name;

  deck.cards.forEach((cardData) => renderSavedCard(cardData));
}

export { renderDeckView };
