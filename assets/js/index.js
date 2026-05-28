import { decks, getDeckByID } from "./decks.js";
import { hexToString, removeColorClasses } from "./colorMap.js";
import { renderDeckView } from "./deckView.js";
import { renderCarouselView } from "./carousel.js";

const homeSection = document.querySelector("#home");
const deckViewSection = document.querySelector("#deck-view");
const carouselSection = document.querySelector("#carousel");
const notFoundSection = document.querySelector("#not-found");
const pageEl = document.querySelector(".page");
const mainContentEl = document.querySelector(".page__main-content");

/* I decided to create a single function to manage the visibility of
 *  each section. I figured it would be easier to hide all sections
 *  first and then show only the section passed into the function.
 *  I was trying to apply the DRY concept. I know this hasn't really
 *  been taught yet, but it seems like a good practice.
 */

function showSection(activeSection) {
  homeSection.classList.add("page__section_hidden");
  deckViewSection.classList.add("page__section_hidden");
  carouselSection.classList.add("page__section_hidden");
  notFoundSection.classList.add("page__section_hidden");

  activeSection.classList.remove("page__section_hidden");

  const showMobileBar =
    activeSection === homeSection || activeSection === deckViewSection;

  showMobileBar
    ? pageEl.classList.remove("page_no-mobile-bar")
    : pageEl.classList.add("page_no-mobile-bar");

  mainContentEl.classList.toggle(
    "page__main-content_page_carousel",
    activeSection === carouselSection,
  );
}

// Home view
function renderHomeView() {
  showSection(homeSection);

  const deckTemplateEl = document.querySelector("#deck-template");
  const deckContainerEl = homeSection.querySelector(".gallery__list");
  deckContainerEl.innerHTML = "";

  // Deck template
  function createDeckEl(deck) {
    const deckEl = deckTemplateEl.content
      .querySelector(".card")
      .cloneNode(true);

    // Deck color
    const deckColor = hexToString(deck.color);

    if (deckColor && deckColor !== "default") {
      removeColorClasses(deckEl);
      deckEl.classList.add(`card_color_${deckColor}`);
    }

    // Deck text
    const deckTitleEl = deckEl.querySelector(".card__title");
    deckTitleEl.textContent = deck.name;

    const deckCountEl = deckEl.querySelector(".card__count");
    deckCountEl.textContent = `${deck.cards.length} cards`;

    // Deck delete button
    const deleteBtn = deckEl.querySelector(".card__delete-btn");
    deleteBtn.addEventListener("click", () => {
      deckEl.remove();
    });

    // Deck link
    const deckLinkEl = deckEl.querySelector(".card__link");
    deckLinkEl.href = `#deck/${deck.id}`;

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
  const isDeckView = hash.startsWith("deck/");
  const isCarouselView = hash.startsWith("carousel/");

  if (hash === "home" || hash === "") {
    renderHomeView();
  } else if (isDeckView) {
    const deckID = hash.split("/")[1];
    const deck = getDeckByID(deckID);

    if (!deck) {
      renderNotFoundView();
      return;
    }

    showSection(deckViewSection);
    renderDeckView(deck);
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
