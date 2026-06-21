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

function getDeckColorClass() {
  const deckColor = hexToString(currentDeck.color);
  return deckColor && deckColor !== "default"
    ? `card_color_${deckColor}`
    : null;
}

function applyDeckColor(cardEl) {
  const deckColorClass = getDeckColorClass();

  if (deckColorClass) {
    removeColorClasses(cardEl);
    cardEl.classList.add(deckColorClass);
  }
}

function getCardIndex(cardID) {
  return currentDeck.cards.findIndex((card) => card._id === cardID);
}

function replaceDeckCard(updatedCard) {
  const cardIndex = getCardIndex(updatedCard._id);

  if (cardIndex !== -1) {
    currentDeck.cards.splice(cardIndex, 1, updatedCard);
  }
}

function clearActiveEditorListeners() {
  document.removeEventListener("keydown", handleEditorEscClose);
  document.removeEventListener("mousedown", handleEditorOutsideClick);
}

function setActiveEditor(editor) {
  clearActiveEditorListeners();
  activeEditor = editor;
  document.addEventListener("keydown", handleEditorEscClose);
  document.addEventListener("mousedown", handleEditorOutsideClick);
}

function clearActiveEditor() {
  clearActiveEditorListeners();
  activeEditor = null;
}

function openDiscardModal({ title, message, onConfirm }) {
  openConfirmationModal({
    title,
    message,
    confirmText: "Discard",
    cancelText: "Keep editing",
    onConfirm,
  });
}

function focusActiveField(editor) {
  const activeField = editor.el.querySelector(
    `.card__field_type_${editor.side}`,
  );

  activeField.focus();
}

function syncEditorValue(editor) {
  const activeField = editor.el.querySelector(
    `.card__field_type_${editor.side}`,
  );

  editor.values[editor.side] = activeField.value;
}

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

function updateSaveButton(editor) {
  const saveBtn = editor.el.querySelector(".card__save-btn");
  const currentValue = editor.values[editor.side].trim();

  if (editor.side === sideNames.question) {
    saveBtn.disabled = currentValue.length === 0;
    return;
  }

  saveBtn.disabled = false;
}

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

function createSavedCardEl(cardData, initialSide = sideNames.question) {
  const flashcardEl = flashcardTemplateEl.content
    .querySelector(".card")
    .cloneNode(true);

  const flashcardTextEl = flashcardEl.querySelector(".card__title");

  let showingQuestion = initialSide === sideNames.question;

  applyDeckColor(flashcardEl);

  const flipBtn = flashcardEl.querySelector(".card__flip-btn");

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

function renderSavedCard(cardData, initialSide = sideNames.question) {
  const flashcardEl = createSavedCardEl(cardData, initialSide);
  flashcardContainerEl.append(flashcardEl);
}

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

function restoreEditedCard(editor) {
  const savedCardEl = createSavedCardEl(editor.cardData, editor.side);
  editor.el.replaceWith(savedCardEl);
  clearActiveEditor();
}

function cancelNewCard(editor) {
  editor.el.remove();
  newCardBtn.hidden = false;
  clearActiveEditor();
}

function hasEditChanges(editor) {
  syncEditorValue(editor);

  return (
    editor.values.question !== editor.originalValues.question ||
    editor.values.answer !== editor.originalValues.answer
  );
}

function hasNewCardDraft(editor) {
  syncEditorValue(editor);

  return (
    editor.values.question.trim().length > 0 ||
    editor.values.answer.trim().length > 0
  );
}

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

function handleEditorEscClose(evt) {
  if (modalEl.classList.contains("modal_visible")) {
    return;
  }

  if (evt.key !== "Escape") {
    return;
  }

  attemptCloseActiveEditor();
}

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

function renderDeckView(deck) {
  clearActiveEditor();
  currentDeck = deck;
  newCardBtn.hidden = false;

  flashcardContainerEl.innerHTML = "";

  deckTitleEl.textContent = deck.name;

  deck.cards.forEach((cardData) => renderSavedCard(cardData));
}

export { renderDeckView };
