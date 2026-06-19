import { fetchedDecks, getDeckByID } from "./decks.js";
import { hexToString, removeColorClasses } from "./colorMap.js";
import { renderDeckView } from "./deckView.js";
import { renderCarouselView } from "./carousel.js";
import { openConfirmationModal, showError } from "./modal.js";
import { disableSubmitBtn } from "./new-deck-view.js";
import { getDecks, deleteDeck } from "./api.js";

const homeSection = document.querySelector("#home");
const newDeckSection = document.querySelector("#new-deck-view");
const deckViewSection = document.querySelector("#deck-view");
const carouselSection = document.querySelector("#carousel");
const notFoundSection = document.querySelector("#not-found");
const aboutSection = document.querySelector("#about");

const pageEl = document.querySelector(".page");
const mainContentEl = document.querySelector(".page__main-content");
const newDeckBtn = document.querySelector("#home .gallery__new-card-btn");
const deckTemplateEl = document.querySelector("#deck-template");
const deckContainerEl = homeSection.querySelector(".gallery__list");

function showView(activeView) {
  homeSection.classList.add("page__section_hidden");
  newDeckSection.classList.add("page__section_hidden");
  deckViewSection.classList.add("page__section_hidden");
  carouselSection.classList.add("page__section_hidden");
  notFoundSection.classList.add("page__section_hidden");
  aboutSection.classList.add("page__section_hidden");

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

  pageEl.classList.toggle(
    "page_footer-fixed",
    activeView === newDeckSection || activeView === carouselSection,
  );
}

// Home view
function renderHomeView() {
  deckContainerEl.innerHTML = "";
}

// Deck template
function createDeckEl(deck) {
  const deckEl = deckTemplateEl.content.querySelector(".card").cloneNode(true);

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
      deleteDeck(deck._id)
        .then(() => {
          deckEl.remove();

          const deckIndex = fetchedDecks.findIndex(
            (fetchedDeck) => fetchedDeck === deck._id,
          );

          if (deckIndex !== -1) {
            fetchedDecks.splice(deckIndex, 1);
          }
        })
        .catch(() => {
          showError("Error deleting deck");
        });
    });
  });

  // Deck link
  const deckLinkEl = deckEl.querySelector(".card__link");
  deckLinkEl.href = `#deck/${deck._id}`;

  return deckEl;
}

function renderDeckEl(deck) {
  const deckEl = createDeckEl(deck);
  deckContainerEl.prepend(deckEl);
}

window.addEventListener("deckadded", (evt) => {
  renderDeckEl(evt.detail);
});

// New Deck Event Listener
newDeckBtn.addEventListener("click", () => {
  window.location.hash = "#new-deck-view";
});

// Main router
function router() {
  const hash = window.location.hash.slice(1) || "home";
  const isNewDeckView = hash === "new-deck-view";
  const isDeckView = hash.startsWith("deck/");
  const isCarouselView = hash.startsWith("carousel/");
  const isAboutView = hash.startsWith("about");

  if (hash === "home" || hash === "") {
    showView(homeSection);
  } else if (isNewDeckView) {
    disableSubmitBtn();
    showView(newDeckSection);
  } else if (isDeckView) {
    const deckID = hash.split("/")[1];
    const deck = getDeckByID(deckID);

    if (!deck) {
      showView(homeSection);
      showError("Sorry, there was an issue fetching that deck.");
      return;
    }

    showView(deckViewSection);
    renderDeckView(deck);
  } else if (isCarouselView) {
    const deckID = hash.split("/")[1];
    const deck = getDeckByID(deckID);

    // Handle missing carousel decks.
    if (!deck) {
      showView(homeSection);
      showError("Sorry, there was an issue fetching the deck.");
      return;
    }

    showView(carouselSection);
    renderCarouselView(deck);
  } else if (isAboutView) {
    showView(aboutSection);
    return;
  } else {
    showView(notFoundSection);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  getDecks()
    .then((decks) => {
      fetchedDecks.push(...decks);
      renderHomeView();
      decks.forEach(renderDeckEl);
    })
    .catch(showError)
    .finally(() => {
      router();
    });
});
window.addEventListener("hashchange", router);
