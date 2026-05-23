import { hexToString, removeColorClasses } from "./colorMap.js";

const deckViewSection = document.querySelector("#deck-view");
const deckTitleEl = deckViewSection.querySelector(".gallery__title");
const flashcardTemplateEl = document.querySelector("#flashcard-template");
const flashcardContainerEl = deckViewSection.querySelector(".gallery__list");

function renderDeckView(deck) {
  flashcardContainerEl.innerHTML = "";

  deckTitleEl.textContent = deck.name;

  function createFlashcardEl(card) {
    const flashcardEl = flashcardTemplateEl.content
      .querySelector(".card")
      .cloneNode(true);
    const deckColor = hexToString(deck.color);
    const flashcardTitleEl = flashcardEl.querySelector(".card__title");
    const flipBtn = flashcardEl.querySelector(".card__flip-btn");
    const deleteBtn = flashcardEl.querySelector(".card__delete-btn");
    let showingQuestion = true;

    if (deckColor && deckColor !== "default") {
      removeColorClasses(flashcardEl);
      flashcardEl.classList.add(`card_color_${deckColor}`);
    }

    function updateDisplay() {
      if (showingQuestion) {
        flashcardTitleEl.textContent = card.question;
        flashcardEl.classList.remove("card_color_white");
      } else {
        flashcardTitleEl.textContent = card.answer;
        flashcardEl.classList.add("card_color_white");
      }
    }

    flipBtn.addEventListener("click", () => {
      showingQuestion = !showingQuestion;
      updateDisplay();
    });

    deleteBtn.addEventListener("click", () => {
      flashcardEl.remove();
    });

    updateDisplay();

    return flashcardEl;
  }

  function renderFlashcardEl(card) {
    const flashcardEl = createFlashcardEl(card);
    flashcardContainerEl.append(flashcardEl);
  }

  deck.cards.forEach(renderFlashcardEl);
}

export { renderDeckView };
