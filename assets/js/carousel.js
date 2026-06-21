import { hexToString, removeColorClasses } from "./colorMap.js";

const carouselEl = document.querySelector("#carousel");
const leftBtn = carouselEl.querySelector(".carousel__btn_type_left");
const rightBtn = carouselEl.querySelector(".carousel__btn_type_right");
const flipBtn = carouselEl.querySelector(".carousel__btn_type_flip");

let currentDeck = null;
let currentIndex = 0;
let showingQuestion = true;
let updateDisplay = null;

/**
 * Renders the carousel view for one deck and resets it to the first card.
 *
 * @param {object} deck - The deck to practice.
 * @param {string} deck.name - The deck name.
 * @param {string} deck.color - The deck color hex value.
 * @param {Array<object>} deck.cards - The deck's cards.
 * @returns {void}
 */
function renderCarouselView(deck) {
  currentDeck = deck;
  currentIndex = 0;
  showingQuestion = true;

  const deckTitleEl = carouselEl.querySelector(".carousel__title");
  const cardEl = carouselEl.querySelector(".carousel__card");
  const cardTextEl = carouselEl.querySelector(".carousel__card-text");

  const cardColor = hexToString(deck.color) || "default";
  removeColorClasses(cardEl);
  cardEl.classList.add(`carousel__card_color_${cardColor}`);

  /**
   * Disables a carousel navigation button.
   *
   * @param {HTMLButtonElement} buttonEl - The button to disable.
   * @returns {void}
   */
  function disableButton(buttonEl) {
    buttonEl.classList.add("carousel__btn_disabled");
    buttonEl.disabled = true;
  }

  /**
   * Enables a carousel navigation button.
   *
   * @param {HTMLButtonElement} buttonEl - The button to enable.
   * @returns {void}
   */
  function enableButton(buttonEl) {
    buttonEl.classList.remove("carousel__btn_disabled");
    buttonEl.removeAttribute("disabled");
  }

  /**
   * Updates the previous and next buttons based on the current card index.
   *
   * @returns {void}
   */
  function updateArrows() {
    if (currentIndex === 0) {
      disableButton(leftBtn);
    } else {
      enableButton(leftBtn);
    }

    if (currentIndex === currentDeck.cards.length - 1) {
      disableButton(rightBtn);
    } else {
      enableButton(rightBtn);
    }
  }

  /**
   * Builds the carousel title showing the deck name and current progress.
   *
   * @param {object} deck - The active deck.
   * @param {number} cardIndex - The zero-based index of the active card.
   * @returns {string} The title text for the carousel.
   */
  function getCarouselTitleString(deck, cardIndex) {
    return `${deck.name} • ${cardIndex + 1}/${deck.cards.length}`;
  }

  /**
   * Updates the carousel card text, color, and navigation controls.
   *
   * @returns {void}
   */
  updateDisplay = function () {
    const currentCard = currentDeck.cards[currentIndex];

    deckTitleEl.textContent = getCarouselTitleString(currentDeck, currentIndex);

    if (showingQuestion) {
      cardTextEl.textContent = currentCard.question;
      cardEl.classList.remove("carousel__card_color_white");
      cardTextEl.classList.remove("carousel__card-text_showing-answer");
    } else {
      cardTextEl.textContent = currentCard.answer;
      cardEl.classList.add("carousel__card_color_white");
      cardTextEl.classList.add("carousel__card-text_showing-answer");
    }

    updateArrows();
  };

  updateDisplay();
}

rightBtn.addEventListener("click", () => {
  if (!currentDeck || !updateDisplay) {
    return;
  }

  if (currentIndex < currentDeck.cards.length - 1) {
    currentIndex++;
    showingQuestion = true;
    updateDisplay();
  }
});

leftBtn.addEventListener("click", () => {
  if (!currentDeck || !updateDisplay) {
    return;
  }

  if (currentIndex > 0) {
    currentIndex--;
    showingQuestion = true;
    updateDisplay();
  }
});

flipBtn.addEventListener("click", () => {
  if (!currentDeck || !updateDisplay) {
    return;
  }

  showingQuestion = !showingQuestion;
  updateDisplay();
});

export { renderCarouselView };
