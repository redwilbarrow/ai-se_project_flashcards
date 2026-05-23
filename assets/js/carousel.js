import { hexToString, removeColorClasses } from "./colorMap.js";

const carouselEl = document.querySelector("#carousel");
const deckTitleEl = carouselEl.querySelector(".carousel__title");
const leftBtn = carouselEl.querySelector(".carousel__btn_type_left");
const rightBtn = carouselEl.querySelector(".carousel__btn_type_right");
const flipBtn = carouselEl.querySelector(".carousel__btn_type_flip");
const cardEl = carouselEl.querySelector(".carousel__card");
const cardTextEl = carouselEl.querySelector(".carousel__card-text");

let currentDeck = null;
let currentIndex = 0;
let showingQuestion = true;

//-------------------------- Button Managment --------------------------

function disableButton(buttonEl) {
  buttonEl.classList.add("carousel__btn_disabled");
  buttonEl.disabled = true;
}

function enableButton(buttonEl) {
  buttonEl.classList.remove("carousel__btn_disabled");
  buttonEl.removeAttribute("disabled");
}

function updateArrows() {
  if (!currentDeck) {
    return;
  }

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

//-------------------------- Update Display Managment --------------------------
function getCarouselTitleString(deck, cardIndex) {
  return `${deck.name} • ${cardIndex + 1}/${deck.cards.length}`;
}

function updateDisplay() {
  if (!currentDeck) {
    return;
  }

  const currentCard = currentDeck.cards[currentIndex];
  const cardColor = hexToString(currentDeck.color);

  deckTitleEl.textContent = getCarouselTitleString(currentDeck, currentIndex);

  removeColorClasses(cardEl);

  if (cardColor && cardColor !== "default") {
    cardEl.classList.add(`carousel__card_color_${cardColor}`);
  }

  if (showingQuestion) {
    cardTextEl.textContent = currentCard.question;
  } else {
    cardTextEl.textContent = currentCard.answer;
    cardEl.classList.add("carousel__card_color_white");
  }

  updateArrows();
}

//-------------------------- Event Listener Managment --------------------------
rightBtn.addEventListener("click", () => {
  if (!currentDeck || currentIndex >= currentDeck.cards.length - 1) {
    return;
  }

  currentIndex++;
  showingQuestion = true;
  updateDisplay();
});

leftBtn.addEventListener("click", () => {
  if (!currentDeck || currentIndex <= 0) {
    return;
  }

  currentIndex--;
  showingQuestion = true;
  updateDisplay();
});

flipBtn.addEventListener("click", () => {
  if (!currentDeck) {
    return;
  }

  showingQuestion = !showingQuestion;
  updateDisplay();
});

function renderCarouselView(deck) {
  currentDeck = deck;
  currentIndex = 0;
  showingQuestion = true;

  updateDisplay();
}

export { renderCarouselView };
