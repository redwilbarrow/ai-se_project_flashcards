# Flash Cards

A browser-based flashcard study app built for TripleTen’s AI-Assisted Software Engineering program.

Flash Cards helps software engineering students study HTML, CSS, JavaScript, Git, developer tools, and common web development terms. I built it as a front-end single-page application using semantic HTML, modular CSS, JavaScript modules, reusable templates, hash-based routing, and the TripleTen Flashcards API.

## Deployed Site

[View the live Flash Cards app](https://redwilbarrow.github.io/ai-se_project_flashcards)

## Project Overview

Flash Cards is an interactive study app where users can browse decks, open a deck, flip cards, practice cards one at a time, create new decks from JSON, and manage cards inside a deck.

The app uses hash-based routing to switch between the home view, deck view, carousel practice view, new deck form, About page, and custom not-found page. Deck and card data is loaded from the TripleTen Flashcards API, and the app sends API requests when users create decks, add cards, edit cards, or delete content.

## Features

- Load saved flashcard decks from the TripleTen Flashcards API
- Browse available decks in a responsive gallery
- Open a deck to view all cards in that deck
- Flip individual cards between question and answer states
- Practice a deck one card at a time in a carousel view
- Move forward and backward through carousel cards
- Disable carousel arrow buttons at the first and last cards
- Create a new deck by pasting valid JSON into the new deck form
- Pick a color for a newly created deck
- Validate new deck JSON before sending it to the API
- Add new cards to an existing deck
- Edit existing card questions and answers
- Delete decks and cards with confirmation modals
- Show reusable error modals when API requests or validation fail
- Warn users before discarding unsaved card changes
- Navigate between views with hash-based routing
- Show an About page and a custom not-found view
- Use responsive layouts for mobile and desktop screens

## Creating a New Deck

The New Deck view lets users choose a deck color and paste JSON that follows this structure:

```json
{
  "name": "Example Deck",
  "color": "#64D583",
  "cards": [
    {
      "question": "What does HTML stand for?",
      "answer": "HyperText Markup Language"
    },
    {
      "question": "What CSS property changes text color?",
      "answer": "color"
    }
  ]
}
```

The app currently checks that:

- the JSON syntax is valid
- the deck name is a string between 2 and 80 characters
- the cards value is an array
- every card has non-empty question and answer text
- the optional JSON color is a string
- the optional JSON color matches the selected color

After a valid deck is submitted, the app sends it to the API, adds the returned deck to the local deck list, renders it on the home view, and navigates to the new deck’s page.

## How the App Works

The app uses hash-based routing, which means the part of the URL after # controls which view is shown.

Examples:

- `#home` shows the main deck gallery
- `#about` shows the About page
- `#new-deck-view` shows the new deck form
- `#deck/deck-id` shows one deck and its flashcards
- `#carousel/deck-id` shows the practice carousel for one deck
- invalid routes show the not-found page

JavaScript controls which section is visible by adding and removing a hidden section class. This keeps the project as a single-page app without using a framework.

## Technologies Used

- HTML
- CSS
- JavaScript
- JavaScript modules
- Fetch API
- HTML templates
- Normalize.css
- Google Fonts
- SVG icon assets
- Git and GitHub
- GitHub Pages
- TripleTen Flashcards API

## Project Structure

```text
.
├── index.html
├── README.md
├── assets
│   ├── css
│   │   ├── about.css
│   │   ├── card.css
│   │   ├── carousel.css
│   │   ├── footer.css
│   │   ├── gallery.css
│   │   ├── global.css
│   │   ├── header.css
│   │   ├── index.css
│   │   ├── mobile-bar.css
│   │   ├── modal.css
│   │   ├── nav.css
│   │   ├── new-deck-view.css
│   │   ├── not-found.css
│   │   └── page.css
│   ├── images
│   │   ├── check-mark.svg
│   │   ├── delete.svg
│   │   ├── edit.svg
│   │   ├── flip.svg
│   │   ├── left.svg
│   │   └── right.svg
│   ├── js
│   │   ├── api.js
│   │   ├── carousel.js
│   │   ├── colorMap.js
│   │   ├── decks.js
│   │   ├── deckView.js
│   │   ├── index.js
│   │   ├── modal.js
│   │   └── new-deck-view.js
│   └── vendor
│       └── normalize.css
└── favicon.ico
```

## Key Files

- `index.html` contains the main page structure, page sections, modals, and reusable templates.
- `assets/css/index.css` imports the project’s CSS files.
- `assets/js/index.js` controls routing, view switching, and the home deck gallery.
- `assets/js/api.js` contains the API functions for getting, creating, editing, and deleting decks and cards.
- `assets/js/decks.js` stores the starting deck data.
- `assets/js/deckView.js` renders an opened deck and its flashcards.
- `assets/js/carousel.js` controls the practice carousel.
- `assets/js/new-deck-view.js` handles new deck JSON parsing and validation.
- `assets/js/modal.js` controls the confirmation and error modal behavior.
- `assets/js/colorMap.js` converts deck color values into CSS modifier class names.

## What I Practiced

While building this project, I practiced:

- adding event listeners for buttons, forms, cards, and modals
- building responsive layouts for mobile and desktop screens
- debugging issues across HTML, CSS, and JavaScript files
- debugging state across multiple JavaScript modules
- handling asynchronous API responses with promises
- keeping project files organized as the app grew
- organizing CSS into smaller files by block or page section
- parsing and validating JSON from user input
- rendering repeated content with HTML templates
- selecting DOM elements and updating text, classes, links, and attributes
- updating the DOM after create, edit, and delete actions
- using BEM class names to keep styles readable
- using callback functions for confirmation modal behavior
- using CSS Grid and Flexbox for layout
- using guard clauses to stop code when required data is missing
- using hash routing to switch between app views
- using JavaScript modules to separate responsibilities
- using reusable modals for errors, confirmations, and discard warnings
- using the Fetch API to communicate with a backend service
- validating user-provided JSON before submitting data
- writing semantic HTML for clearer page structure

## What I Learned

This project helped me understand how different front-end pieces work together.

The HTML provides the structure, the CSS controls the visual layout, and the JavaScript connects user actions to changes on the page. Features like deck rendering, card flipping, carousel navigation, modal behavior, card editing, and API requests helped me practice real interactive app patterns.

I also learned more about project organization. Separating the app into smaller CSS and JavaScript files made it easier to understand which file owns each part of the project. For example, carousel behavior lives in the carousel module, modal behavior lives in the modal module, API requests live in the API module, and deck rendering logic lives in the deck view module.

Another important lesson was learning how routing affects app state. Because the app uses URL hashes, the JavaScript needs to read the route, find the correct deck, show the correct section, and handle missing or invalid routes.

I also practiced working with asynchronous code. Since the app gets, creates, edits, and deletes data through the API, I had to think about when data is available, how to update the page after a successful request, and how to show an error when something goes wrong.

## Current Limitations

The app is still a learning project, so there are a few limitations:

- New deck card objects have basic required-field validation, but nested or extra fields are not fully validated yet.
- Users can add and edit cards, but there is not yet a full deck editing form.
- Keyboard support for studying cards can be improved.
- API errors are shown to the user, but there is not yet a loading state for every request.
- The app does not currently include automated tests.

## Future Improvements

This project started as a flashcard viewer, but I see it evolving into a more active learning tool. Future improvements I am exploring include:

- Add deeper validation for each card object in a new deck
- Add editing for deck names and deck colors
- Add keyboard controls for carousel practice
- Add loading states during API requests
- Improve the new deck form with clearer placeholder JSON
- Add more flashcard topics
- Add tests for JavaScript helper functions and API-related behavior
- Research a quiz mode with formal scoring and progress feedback
- Explore a memorization mode based on the First Letter Method
- Investigate AI-assisted deck generation from user-provided study notes
- Explore a hybrid AI chatbot that can help users study, ask follow-up questions, and generate more complex flashcard decks

Long term, I would like Flash Cards to become more than a deck viewer. My goal is to keep developing it toward a learning hub that can help users create study materials, practice actively, check their understanding, and receive guided support while they learn.

## Running the Project Locally

This project does not require a build step.

Because it uses JavaScript modules, it is best to run it with a local development server instead of opening the file directly in the browser.

One simple option is the Live Server extension in VS Code:

1. Open the project folder in VS Code.
2. Right-click `index.html`.
3. Select **Open with Live Server**.

## Project Pitch Video

Check out [this video](https://drive.google.com/file/d/1SD6kdLz23dkbx98MdCP2n3ZD2tIzIIrC/view?usp=sharing), where I describe my project and some challenges I faced while building it.

## Author

Built by Paul Barrow-Wilkerson as part of TripleTen’s AI-Assisted Software Engineering program.