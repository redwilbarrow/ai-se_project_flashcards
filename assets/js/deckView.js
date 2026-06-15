import { hexToString, removeColorClasses } from "./colorMap.js";
import { openConfirmationModal } from "./modal.js";

const deckViewSection = document.querySelector("#deck-view");
const deckTitleEl = deckViewSection.querySelector(".gallery__title");
const practiceBtn = deckViewSection.querySelector(".gallery__practice-btn");
const flashcardTemplateEl = document.querySelector("#flashcard-template");
const flashcardContainerEl = deckViewSection.querySelector(".gallery__list");
const galleryWrapperEl = deckViewSection.querySelector(
  ".gallery__grid-wrapper",
);
const galleryErrorTextEl = deckViewSection.querySelector(
  ".gallery__error-text",
);

let currentDeck = null;

practiceBtn.addEventListener("click", () => {
  if (currentDeck) {
    window.location.hash = `#carousel/${currentDeck.id}`;
  }
});

function renderDeckView(deck) {
  currentDeck = deck;

  flashcardContainerEl.innerHTML = "";

  deckTitleEl.textContent = deck.name;

  function createFlashcardEl(cardData) {
    const flashcardEl = flashcardTemplateEl.content
      .querySelector(".card")
      .cloneNode(true);

    const flashcardTextEl = flashcardEl.querySelector(".card__title");

    let showingQuestion = true;

    // Flashcard Color
    const deckColor = hexToString(deck.color);

    if (deckColor && deckColor !== "default") {
      removeColorClasses(flashcardEl);
      flashcardEl.classList.add(`card_color_${deckColor}`);
    }

    // Flip Button
    const flipBtn = flashcardEl.querySelector(".card__flip-btn");

    function updateDisplay() {
      if (showingQuestion) {
        flashcardTextEl.textContent = cardData.question;
        flashcardEl.classList.remove("card_color_white");
      } else {
        flashcardTextEl.textContent = cardData.answer;
        flashcardEl.classList.add("card_color_white");
      }
    }

    flipBtn.addEventListener("click", () => {
      showingQuestion = !showingQuestion;
      updateDisplay();
    });

    // Delete Button
    const deleteBtn = flashcardEl.querySelector(".card__delete-btn");

    deleteBtn.addEventListener("click", () => {
      openConfirmationModal("card", () => {
        flashcardEl.remove();
      });
    });

    updateDisplay();

    return flashcardEl;
  }

  function renderFlashcardEl(cardData) {
    const flashcardEl = createFlashcardEl(cardData);
    flashcardContainerEl.append(flashcardEl);
  }

  if (!Array.isArray(deck.cards)) {
    galleryErrorTextEl.classList.remove("hidden");
    galleryErrorTextEl.textContent =
      "This deck doesn't have any cards to display.";
    galleryWrapperEl.classList.add("hidden");
    return;
  }

  try {
    deck.cards.forEach(renderFlashcardEl);
  } catch (err) {
    console.error(err);
    galleryErrorTextEl.classList.remove("hidden");
    galleryErrorTextEl.textContent = "Sorry, we couldn't display these cards.";
    galleryWrapperEl.classList.add("hidden");
  }
}

export { renderDeckView };
