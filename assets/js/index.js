import { decks, getDeckByID } from "./decks.js";
import { hexToString, removeColorClasses } from "./colorMap.js";
import { renderDeckView } from "./deckView.js";
import { renderCarouselView } from "./carousel.js";
import { openConfirmationModal } from "./modal.js";

const homeSection = document.querySelector("#home");
const newDeckSection = document.querySelector("#new-deck-view");
const deckViewSection = document.querySelector("#deck-view");
const carouselSection = document.querySelector("#carousel");
const notFoundSection = document.querySelector("#not-found");
const pageEl = document.querySelector(".page");
const mainContentEl = document.querySelector(".page__main-content");
const newDeckBtn = document.querySelector("#home .gallery__new-card-btn");

/* I originally built this showView helper during a previous submission to avoid
 * repeating view show/hide logic in every render function. I kept it for this
 * submission instead of replacing it with the optional display-based version
 * from the current instructions because this version follows the same DRY idea,
 * uses the project's page__section_hidden class modifier, and also handles
 * route-specific layout changes like the mobile bar and carousel view styling.
 */
function showView(activeView) {
  homeSection.classList.add("page__section_hidden");
  newDeckSection.classList.add("page__section_hidden");
  deckViewSection.classList.add("page__section_hidden");
  carouselSection.classList.add("page__section_hidden");
  notFoundSection.classList.add("page__section_hidden");

  activeView.classList.remove("page__section_hidden");

  const showMobileBar =
    activeView === homeSection || activeView === deckViewSection;

  showMobileBar
    ? pageEl.classList.remove("page_no-mobile-bar")
    : pageEl.classList.add("page_no-mobile-bar");

  mainContentEl.classList.toggle(
    "page__main-content_page_carousel",
    activeView === carouselSection,
  );

  pageEl.classList.toggle("page_footer-fixed", activeView === newDeckSection);
}

// Home view
function renderHomeView() {
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
      openConfirmationModal("deck", () => {
        deckEl.remove();
      });
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

newDeckBtn.addEventListener("click", () => {
  window.location.hash = "#new-deck-view";
});

// Main router
function router() {
  const hash = window.location.hash.slice(1) || "home";
  const isNewDeckView = hash === "new-deck-view";
  const isDeckView = hash.startsWith("deck/");
  const isCarouselView = hash.startsWith("carousel/");

  if (hash === "home" || hash === "") {
    showView(homeSection);
    renderHomeView();
  } else if (isNewDeckView) {
    showView(newDeckSection);
  } else if (isDeckView) {
    const deckID = hash.split("/")[1];
    const deck = getDeckByID(deckID);

    if (!deck) {
      showView(notFoundSection);
      return;
    }

    showView(deckViewSection);
    renderDeckView(deck);
  } else if (isCarouselView) {
    const deckID = hash.split("/")[1];
    const deck = getDeckByID(deckID);

    // Handle missing carousel decks.
    if (!deck) {
      showView(notFoundSection);
      return;
    }

    showView(carouselSection);
    renderCarouselView(deck);
  } else {
    showView(notFoundSection);
  }
}

window.addEventListener("DOMContentLoaded", router);
window.addEventListener("hashchange", router);
