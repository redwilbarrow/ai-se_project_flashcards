# Flash Cards

A browser-based flashcard study app built for TripleTen’s AI-Assisted Software Engineering program.

This project helps software engineering students study HTML, CSS, JavaScript, Git, developer tools, and common web development terms. I built it as a front-end application using HTML, modular CSS, and JavaScript modules.

## Deployed Site

[View the live Flash Cards app](https://redwilbarrow.github.io/ai-se_project_flashcards)

## Project Overview

Flash Cards is an interactive study app with multiple deck views. Users can browse prebuilt decks, open a deck, flip individual cards, practice cards one at a time in a carousel view, and create a new deck from JSON input.

This project helped me practice moving from a mostly static page into a more interactive front-end app. I worked with reusable templates, DOM rendering, event listeners, route-based views, modals, form validation, and responsive layouts.

## Features

- Browse prebuilt software engineering flashcard decks
- Open a deck to view all cards in that deck
- Flip individual cards between question and answer states
- Practice a deck one card at a time in a carousel view
- Move forward and backward through carousel cards
- Disable carousel arrow buttons at the first and last cards
- Create a new deck by pasting valid JSON into the new deck form
- Pick a color for a newly created deck
- Validate new deck JSON before adding it to the app
- Show an error modal when the JSON is invalid
- Delete decks or cards from the current rendered view
- Confirm delete actions with a reusable confirmation modal
- Navigate between views with hash-based routing
- Show a custom not-found view for invalid routes
- Use responsive layouts for mobile and desktop screens

## Current Deck Topics

The app currently includes decks for:

- HTML Basics
- Semantic HTML
- CSS Fundamentals
- CSS Box Model
- CSS Flexbox
- JavaScript Basics
- JavaScript Functions
- JavaScript Arrays
- JavaScript DOM
- Web Tech Terms
- Developer Tools
- Git Basics

## Creating a New Deck

The app includes a New Deck view where users can paste JSON and choose a deck color.

The JSON should follow this general structure:

```json
{
  "name": "Example Deck",
  "color": "#64D583",
  "cards": [
    {
      "id": 1,
      "question": "What does HTML stand for?",
      "answer": "HyperText Markup Language"
    },
    {
      "id": 2,
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
- the optional JSON color is a string
- the JSON color matches the selected color

New decks are added during the current browser session. They are not saved after the page is refreshed because the app does not use local storage or a database yet.

## How the App Works

The app uses hash-based routing, which means the part of the URL after `#` controls which view is shown.

Examples:

- `#home` shows the main deck gallery
- `#new-deck-view` shows the new deck form
- `#deck/html-basics` shows one deck and its flashcards
- `#carousel/html-basics` shows the practice carousel for one deck
- invalid routes show the not-found page

JavaScript controls which section is visible by adding and removing a hidden section class. This keeps the project as a single-page app without using a framework.

## Technologies Used

- HTML
- CSS
- JavaScript
- JavaScript modules
- HTML templates
- Normalize.css
- Google Fonts
- SVG icon assets
- Git and GitHub
- GitHub Pages

## Project Structure

```text
.
├── index.html
├── README.md
├── assets
│   ├── css
│   │   ├── index.css
│   │   ├── global.css
│   │   ├── page.css
│   │   ├── header.css
│   │   ├── nav.css
│   │   ├── gallery.css
│   │   ├── card.css
│   │   ├── carousel.css
│   │   ├── new-deck-view.css
│   │   ├── modal.css
│   │   ├── not-found.css
│   │   ├── footer.css
│   │   └── mobile-bar.css
│   ├── images
│   │   ├── delete.svg
│   │   ├── flip.svg
│   │   ├── left.svg
│   │   └── right.svg
│   ├── js
│   │   ├── index.js
│   │   ├── decks.js
│   │   ├── deckView.js
│   │   ├── carousel.js
│   │   ├── new-deck-view.js
│   │   ├── modal.js
│   │   └── colorMap.js
│   └── vendor
│       └── normalize.css
└── favicon.ico
```

## Key Files

- `index.html` contains the main page structure, page sections, modals, and reusable templates.
- `assets/css/index.css` imports the project’s CSS files.
- `assets/js/index.js` controls routing, view switching, and the home deck gallery.
- `assets/js/decks.js` stores the starting deck data.
- `assets/js/deckView.js` renders an opened deck and its flashcards.
- `assets/js/carousel.js` controls the practice carousel.
- `assets/js/new-deck-view.js` handles new deck JSON parsing and validation.
- `assets/js/modal.js` controls the confirmation and error modal behavior.
- `assets/js/colorMap.js` converts deck color values into CSS modifier class names.

## What I Practiced

While building this project, I practiced:

- writing semantic HTML for clearer page structure
- organizing CSS into smaller files by block or page section
- using BEM class names to keep styles readable
- building responsive layouts for mobile and desktop screens
- using CSS Grid and Flexbox for layout
- using JavaScript modules to separate responsibilities
- rendering repeated content with HTML templates
- selecting DOM elements and updating text, classes, links, and attributes
- adding event listeners for buttons, forms, cards, and modals
- using callback functions for confirmation modal behavior
- using guard clauses to stop code when required data is missing
- parsing and validating JSON from user input
- using hash routing to switch between app views
- debugging issues across HTML, CSS, and JavaScript files
- keeping project files organized as the app grew

## What I Learned

This project helped me understand how different front-end pieces work together.

The HTML provides the structure, the CSS controls the visual layout, and the JavaScript connects user actions to changes on the page. Features like deck rendering, card flipping, carousel navigation, and modal behavior helped me practice real interactive app patterns.

I also learned more about project organization. Separating the app into smaller CSS and JavaScript files made it easier to understand which file owns each part of the project. For example, carousel behavior lives in the carousel module, modal behavior lives in the modal module, and deck rendering logic lives in the deck view module.

Another important lesson was learning how routing affects app state. Because the app uses URL hashes, the JavaScript needs to read the route, find the correct deck, show the correct section, and handle missing or invalid routes.

## Current Limitations

The app is still a learning project, so there are a few limitations:

- New decks are not saved after refreshing the page.
- Deleted decks and cards are only removed from the current rendered view.
- New deck card objects are not fully validated yet.
- Users cannot edit existing decks or cards yet.
- Keyboard support for studying cards can be improved.

## Future Improvements

Future improvements I would like to add include:

- Save created decks with local storage
- Make deck and card deletion update the underlying data
- Add full validation for each card object in a new deck
- Add editing for decks and cards
- Add keyboard controls for carousel practice
- Improve the new deck form with clearer placeholder JSON
- Add more flashcard topics
- Add tests for the JavaScript helper functions

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