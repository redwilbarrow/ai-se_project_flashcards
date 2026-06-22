const flashcardFormTemplateEl = document.querySelector(
  "#flashcard-form-template",
);

const sideNames = {
  question: "question",
  answer: "answer",
};

let activeEditor = null;

/**
 * @typedef {"question"|"answer"} CardSide
 */

/**
 * @typedef {object} CardValues
 * @property {string} question - The card question text.
 * @property {string} answer - The card answer text.
 */

/**
 * @typedef {object} CardConfirmationState
 * @property {boolean} question - Whether the question side has been confirmed.
 * @property {boolean} answer - Whether the answer side has been confirmed.
 */

/**
 * @typedef {object} CardEditor
 * @property {"new"|"edit"} mode - Whether the editor is creating or editing a card.
 * @property {CardSide} side - The currently visible side of the editor.
 * @property {CardValues} values - The current draft question and answer values.
 * @property {CardConfirmationState} confirmed - Whether each side has been confirmed.
 * @property {HTMLElement} el - The rendered editor card element.
 * @property {object} [cardData] - The saved card data, only used in edit mode.
 * @property {CardValues} [originalValues] - The original saved values, only used in edit mode.
 * @property {Function} applyCardColor - Applies the current deck color to the editor card.
 * @property {Function} createSavedCardEl - Creates the saved card element after save or cancel.
 * @property {Function} saveCard - Saves the current card values.
 * @property {Function} requestDiscard - Opens the discard confirmation modal.
 * @property {Function} isModalOpen - Checks whether a modal is currently visible.
 * @property {Function} [onOpen] - Callback to run when the editor opens.
 * @property {Function} [onClose] - Callback to run when the editor closes.
 * @property {Function} onError - Shows a save error message.
 */

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
 * @param {CardEditor} editor - The card editor state object.
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
function clearCardEditor() {
  clearActiveEditorListeners();
  activeEditor = null;
}

/**
 * Focuses the field for the editor's active side.
 *
 * @param {CardEditor} editor - The card editor state object.
 * @returns {void}
 */
function focusActiveField(editor) {
  const activeField = editor.el.querySelector(
    `.card__field_type_${editor.side}`,
  );

  activeField.focus();
}

/**
 * Copies the active field's current value into editor state so drafts survive flips.
 *
 * @param {CardEditor} editor - The card editor state object.
 * @returns {void}
 */
function syncEditorValue(editor) {
  const activeField = editor.el.querySelector(
    `.card__field_type_${editor.side}`,
  );

  editor.values[editor.side] = activeField.value;
}

/**
 * Returns one editor side value trimmed for validation and API requests.
 *
 * @param {CardEditor} editor - The card editor state object.
 * @param {CardSide} side - The side to read.
 * @returns {string} The trimmed value for the requested side.
 */
function getTrimmedSideValue(editor, side) {
  return String(editor.values[side] ?? "").trim();
}

/**
 * Checks whether the editor's active side has required non-whitespace text.
 *
 * @param {CardEditor} editor - The card editor state object.
 * @returns {boolean} True when the active question or answer side can be confirmed.
 */
function hasActiveSideText(editor) {
  return getTrimmedSideValue(editor, editor.side).length > 0;
}

/**
 * Returns the editor values trimmed for API requests.
 *
 * @param {CardEditor} editor - The card editor state object.
 * @returns {CardValues} The trimmed question and answer values.
 */
function getTrimmedEditorValues(editor) {
  return {
    question: getTrimmedSideValue(editor, sideNames.question),
    answer: getTrimmedSideValue(editor, sideNames.answer),
  };
}

/**
 * Checks whether both sides of an editor have required non-whitespace text.
 *
 * @param {CardEditor} editor - The card editor state object.
 * @returns {boolean} True when both question and answer can be saved.
 */
function hasRequiredCardText(editor) {
  const values = getTrimmedEditorValues(editor);

  return values.question.length > 0 && values.answer.length > 0;
}

/**
 * Switches the form card between question and answer editing sides.
 *
 * @param {CardEditor} editor - The card editor state object.
 * @param {CardSide} side - The side to show.
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

  updateSaveButton(editor);
}

/**
 * Enables or disables the save button for the editor's active side.
 *
 * @param {CardEditor} editor - The card editor state object.
 * @returns {void}
 */
function updateSaveButton(editor) {
  const saveBtn = editor.el.querySelector(".card__save-btn");
  saveBtn.disabled = !hasActiveSideText(editor);
}

/**
 * Creates and wires a form card element for adding or editing a card.
 *
 * @param {CardEditor} editor - The card editor state object.
 * @returns {HTMLElement} The configured form card element.
 */
function createFormCardEl(editor) {
  const formCardEl = flashcardFormTemplateEl.content
    .querySelector(".card")
    .cloneNode(true);

  editor.applyCardColor(formCardEl);
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
  answerField.placeholder = "Type the answer or definition";

  questionField.addEventListener("input", () => {
    editor.values.question = questionField.value;
    editor.confirmed.question = false;
    updateSaveButton(editor);
  });

  answerField.addEventListener("input", () => {
    editor.values.answer = answerField.value;
    editor.confirmed.answer = false;
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
 * Opens a blank form card for creating a new card.
 *
 * @param {object} options - The new card editor options.
 * @param {HTMLElement} options.containerEl - The list where the editor should be added.
 * @param {Function} options.applyCardColor - Applies the current deck color to a card element.
 * @param {Function} options.createSavedCardEl - Creates a saved card element after save.
 * @param {Function} options.saveCard - Saves the new card values.
 * @param {Function} options.requestDiscard - Opens the discard confirmation modal.
 * @param {Function} options.isModalOpen - Checks whether a modal is currently visible.
 * @param {Function} options.onOpen - Callback to run when the editor opens.
 * @param {Function} options.onClose - Callback to run when the editor closes.
 * @param {Function} options.onError - Shows a save error message.
 * @returns {void}
 */
function openNewCardEditor(options) {
  if (activeEditor) {
    attemptCloseActiveEditor();
    return;
  }

  const editor = {
    mode: "new",
    side: sideNames.question,
    values: { question: "", answer: "" },
    confirmed: { question: false, answer: false },
    ...options,
  };

  const formCardEl = createFormCardEl(editor);
  options.containerEl.append(formCardEl);
  options.onOpen();
  setActiveEditor(editor);
  focusActiveField(editor);
}

/**
 * Replaces a saved card with an edit form for that card.
 *
 * @param {object} options - The edit card editor options.
 * @param {object} options.cardData - The saved card data to edit.
 * @param {HTMLElement} options.savedCardEl - The saved card element being replaced.
 * @param {CardSide} options.initialSide - The side to show first.
 * @param {Function} options.applyCardColor - Applies the current deck color to a card element.
 * @param {Function} options.createSavedCardEl - Creates a saved card element after save or cancel.
 * @param {Function} options.saveCard - Saves the edited card values.
 * @param {Function} options.requestDiscard - Opens the discard confirmation modal.
 * @param {Function} options.isModalOpen - Checks whether a modal is currently visible.
 * @param {Function} options.onError - Shows a save error message.
 * @returns {void}
 */
function openEditCardEditor(options) {
  if (activeEditor) {
    attemptCloseActiveEditor();
    return;
  }

  const { cardData, initialSide } = options;
  const editor = {
    mode: "edit",
    side: initialSide,
    values: {
      question: cardData.question,
      answer: cardData.answer,
    },
    confirmed: { question: false, answer: false },
    originalValues: {
      question: cardData.question,
      answer: cardData.answer,
    },
    ...options,
  };

  const formCardEl = createFormCardEl(editor);
  options.savedCardEl.replaceWith(formCardEl);
  setActiveEditor(editor);
  focusActiveField(editor);
}

/**
 * Handles a form card save attempt for either a new or existing card.
 *
 * @param {CardEditor} editor - The card editor state object.
 * @returns {void}
 */
function handleFormSave(editor) {
  syncEditorValue(editor);

  if (!hasActiveSideText(editor)) {
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
 * Confirms each required side of a new card and saves after both sides are confirmed.
 * Flipping to the other side is allowed before either side is filled in.
 *
 * @param {CardEditor} editor - The new card editor state object.
 * @returns {void}
 */
function handleNewCardSideSave(editor) {
  editor.confirmed[editor.side] = true;

  const otherSide =
    editor.side === sideNames.question ? sideNames.answer : sideNames.question;

  if (!editor.confirmed[otherSide]) {
    updateFormSide(editor, otherSide);
    focusActiveField(editor);
    return;
  }

  if (!hasRequiredCardText(editor)) {
    updateSaveButton(editor);
    return;
  }

  const saveBtn = editor.el.querySelector(".card__save-btn");
  saveBtn.disabled = true;

  editor
    .saveCard(getTrimmedEditorValues(editor))
    .then((newCard) => {
      const savedCardEl = editor.createSavedCardEl(newCard);
      editor.el.replaceWith(savedCardEl);
      editor.onClose();
      clearCardEditor();
    })
    .catch(() => {
      updateSaveButton(editor);
      editor.onError("Error adding card");
    });
}

/**
 * Sends required edited card values through the save callback and renders the updated saved card.
 *
 * @param {CardEditor} editor - The edit card editor state object.
 * @returns {void}
 */
function handleEditCardSave(editor) {
  if (!hasRequiredCardText(editor)) {
    updateSaveButton(editor);
    return;
  }

  const updatedValues = getTrimmedEditorValues(editor);
  const saveBtn = editor.el.querySelector(".card__save-btn");
  saveBtn.disabled = true;

  editor
    .saveCard(editor.cardData, updatedValues)
    .then((savedCardData) => {
      const savedCardEl = editor.createSavedCardEl(savedCardData, editor.side);
      editor.el.replaceWith(savedCardEl);
      clearCardEditor();
    })
    .catch(() => {
      updateSaveButton(editor);
      editor.onError("Error editing card");
    });
}

/**
 * Restores the original saved card element after canceling an edit.
 *
 * @param {CardEditor} editor - The edit card editor state object.
 * @returns {void}
 */
function restoreEditedCard(editor) {
  const savedCardEl = editor.createSavedCardEl(editor.cardData, editor.side);
  editor.el.replaceWith(savedCardEl);
  clearCardEditor();
}

/**
 * Removes an unsaved new card form and runs the close callback.
 *
 * @param {CardEditor} editor - The new card editor state object.
 * @returns {void}
 */
function cancelNewCard(editor) {
  editor.el.remove();
  editor.onClose();
  clearCardEditor();
}

/**
 * Checks whether an edited card has unsaved changes.
 *
 * @param {CardEditor} editor - The edit card editor state object.
 * @returns {boolean} True when the current values differ from the original values.
 */
function hasEditChanges(editor) {
  syncEditorValue(editor);

  return (
    editor.values.question.trim() !== editor.originalValues.question.trim() ||
    editor.values.answer.trim() !== editor.originalValues.answer.trim()
  );
}

/**
 * Checks whether a new card form has any non-whitespace draft text.
 *
 * @param {CardEditor} editor - The new card editor state object.
 * @returns {boolean} True when either side of the new card contains non-whitespace text.
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

    editor.requestDiscard({
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

  editor.requestDiscard({
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
  if (!activeEditor || activeEditor.isModalOpen()) {
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
  if (!activeEditor || activeEditor.isModalOpen()) {
    return;
  }

  if (activeEditor.el.contains(evt.target)) {
    return;
  }

  attemptCloseActiveEditor();
}

export { clearCardEditor, openEditCardEditor, openNewCardEditor, sideNames };
