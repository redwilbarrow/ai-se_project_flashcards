import { decks, getDeckByID } from "./decks.js";
import { hexToString, removeColorClasses } from "./colorMap.js";
import { renderCarouselView } from "./carousel.js";

const homeSection = document.querySelector("#home");
const carouselSection = document.querySelector("#carousel");
const notFoundSection = document.querySelector("#not-found");
const mainContentEl = document.querySelector(".page__main-content");

/* I decided to create a single function to manage the visibility of
 *  each section. I figured it would be easier to hide all sections
 *  first and then show only the section passed into the function.
 *  I was trying to apply the DRY concept. I know this hasn't really
 *  been taught yet, but it seems like a good practice.
 */

function showSection(activeSection) {
  homeSection.classList.add("page__section_hidden");
  carouselSection.classList.add("page__section_hidden");
  notFoundSection.classList.add("page__section_hidden");

  activeSection.classList.remove("page__section_hidden");
}

// Home view
function renderHomeView() {
  showSection(homeSection);

  const deckTemplateEl = document.querySelector("#deck-template");
  const deckContainerEl = document.querySelector(".decks__list");
  deckContainerEl.innerHTML = "";

  // Deck template
  function createDeckEl(deck) {
    const deckEl = deckTemplateEl.content
      .querySelector(".deck")
      .cloneNode(true);

    // Deck color
    const deckColor = hexToString(deck.color);

    if (deckColor && deckColor !== "default") {
      removeColorClasses(deckEl);
      deckEl.classList.add(`deck_color_${deckColor}`);
    }

    // Deck text
    const deckTitleEl = deckEl.querySelector(".deck__title");
    deckTitleEl.textContent = deck.name;

    const deckCountEl = deckEl.querySelector(".deck__count");
    deckCountEl.textContent = `${deck.cards.length} cards`;

    // Deck delete button
    const deleteBtn = deckEl.querySelector(".deck__delete-btn");
    deleteBtn.addEventListener("click", () => {
      deckEl.remove();
    });

    // Deck link
    const deckLinkEl = deckEl.querySelector(".deck__link");
    deckLinkEl.href = `#carousel/${deck.id}`;

    return deckEl;
  }

  function renderDeckEl(deck) {
    const deckEl = createDeckEl(deck);
    deckContainerEl.prepend(deckEl);
  }

  decks.forEach(renderDeckEl);
}

// Not found view
function renderNotFoundView() {
  showSection(notFoundSection);
}

// Main router
function router() {
  const hash = window.location.hash.slice(1) || "home";
  const isCarouselView = hash.startsWith("carousel/");

  mainContentEl.classList.toggle(
    "page__main-content_page_carousel",
    isCarouselView,
  );

  if (hash === "home" || hash === "") {
    renderHomeView();
  } else if (isCarouselView) {
    const deckID = hash.split("/")[1];
    const deck = getDeckByID(deckID);

    // Handle missing carousel decks.
    if (!deck) {
      renderNotFoundView();
      return;
    }

    showSection(carouselSection);
    renderCarouselView(deck);
  } else {
    renderNotFoundView();
  }
}

window.addEventListener("DOMContentLoaded", router);
window.addEventListener("hashchange", router);
