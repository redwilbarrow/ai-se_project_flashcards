import { hexToString, removeColorClasses } from "./colorMap.js";

function renderCarouselView(deck) {
  let currentIndex = 0;
  let showingQuestion = true;

  //-------------------------- Carousel Element Selectors --------------------------
  const carouselEl = document.querySelector("#carousel");
  const deckTitleEl = carouselEl.querySelector(".carousel__title");

  // Clone controls to clear previously attached listeners when this view re-renders.
  // TODO: Refactor carousel controls so listeners are attached once at module scope.
  const ogLeftBtn = carouselEl.querySelector(".carousel__btn_type_left");
  const ogRightBtn = carouselEl.querySelector(".carousel__btn_type_right");
  const ogFlipBtn = carouselEl.querySelector(".carousel__btn_type_flip");

  const leftBtn = ogLeftBtn.cloneNode(true);
  const rightBtn = ogRightBtn.cloneNode(true);
  const flipBtn = ogFlipBtn.cloneNode(true);

  ogLeftBtn.replaceWith(leftBtn);
  ogRightBtn.replaceWith(rightBtn);
  ogFlipBtn.replaceWith(flipBtn);

  const cardEl = carouselEl.querySelector(".carousel__card");
  const cardTextEl = carouselEl.querySelector(".carousel__card-text");

  //-------------------------- Carousel Card Color Managment --------------------------
  const cardColor = hexToString(deck.color);

  if (cardColor && cardColor !== "default") {
    removeColorClasses(cardEl);
    cardEl.classList.add(`carousel__card_color_${cardColor}`);
  }

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
    if (currentIndex === 0) {
      disableButton(leftBtn);
    } else {
      enableButton(leftBtn);
    }

    if (currentIndex === deck.cards.length - 1) {
      disableButton(rightBtn);
    } else {
      enableButton(rightBtn);
    }
  }

  //-------------------------- Update Display Managment --------------------------
  /* I looked through all previous lessons and could not find a `getCarouselTitleString()`
   *  function. So I did my best. I actually don't see the need for this to be in a separate
   *  function, not seeing the need for reusability. But that is what the instructions said to do.
   */
  function getCarouselTitleString(deck, cardIndex) {
    return `${deck.name} • ${cardIndex + 1}/${deck.cards.length}`;
  }

  function updateDisplay() {
    const currentCard = deck.cards[currentIndex];

    deckTitleEl.textContent = getCarouselTitleString(deck, currentIndex);

    if (showingQuestion) {
      cardTextEl.textContent = currentCard.question;
      cardEl.classList.remove("carousel__card_color_white");
    } else {
      cardTextEl.textContent = currentCard.answer;
      cardEl.classList.add("carousel__card_color_white");
    }

    updateArrows();
  }

  //-------------------------- Event Listener Managment --------------------------
  rightBtn.addEventListener("click", () => {
    if (currentIndex < deck.cards.length - 1) {
      currentIndex++;
      showingQuestion = true;
      updateDisplay();
    }
  });

  leftBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      showingQuestion = true;
      updateDisplay();
    }
  });

  flipBtn.addEventListener("click", () => {
    showingQuestion = !showingQuestion;
    updateDisplay();
  });

  updateDisplay();
}

export { renderCarouselView };
