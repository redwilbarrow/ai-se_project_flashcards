import { hexToString, removeColorClasses } from "./colorMap.js";

const carouselEl = document.querySelector("#carousel");
const leftBtn = carouselEl.querySelector(".carousel__btn_type_left");
const rightBtn = carouselEl.querySelector(".carousel__btn_type_right");
const flipBtn = carouselEl.querySelector(".carousel__btn_type_flip");

let currentDeck = null;
let currentIndex = 0;
let showingQuestion = true;
let updateDisplay = null;

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

  function disableButton(buttonEl) {
    buttonEl.classList.add("carousel__btn_disabled");
    buttonEl.disabled = true;
  }

  function enableButton(buttonEl) {
    buttonEl.classList.remove("carousel__btn_disabled");
    buttonEl.removeAttribute("disabled");
  }

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

  function getCarouselTitleString(deck, cardIndex) {
    return `${deck.name} • ${cardIndex + 1}/${deck.cards.length}`;
  }

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
