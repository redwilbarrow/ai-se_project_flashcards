# Flashcard App

A browser-based flashcard study app I built for TripleTen’s AI-Assisted Software Engineering program. This is my Project 1 submission, and I used it to practice building a complete front-end application with HTML, CSS, and JavaScript.

The app helps users study software engineering concepts through organized decks, individual flashcards, deck views, and a carousel-style practice mode.

## Deployed Site

[View the live Flashcard App](https://redwilbarrow.github.io/ai-se_project_flashcards)

## Project Overview

For this project, I built a flashcard app focused on beginner software engineering topics. Users can browse available decks, open a deck to view its cards, flip cards to reveal answers, and practice cards one at a time in a carousel view.

This project helped me connect coding theory with real implementation. Instead of only writing static HTML and CSS, I practiced building an interactive application with reusable JavaScript modules, DOM updates, event listeners, and view-based navigation.

## Features

- Browse prebuilt flashcard decks
- Open individual deck views to see all cards in a selected deck
- Flip cards to switch between questions and answers
- Practice a deck in a carousel-style study view
- Navigate forward and backward through practice cards
- Delete decks or cards from the current view
- Confirm delete actions with a confirmation modal
- View a custom not-found page for invalid routes
- Use a responsive layout designed for both mobile and desktop screens

## What I Practiced

While building this project, I practiced several important front-end development concepts and conventions:

- Semantic HTML structure for clearer, more meaningful page markup
- CSS organization using separate files for major page sections and components
- BEM naming conventions for readable and maintainable class names
- Responsive design with layouts that adapt to different screen sizes
- JavaScript modules to separate app logic into focused files
- DOM manipulation to render decks, cards, and changing views dynamically
- HTML templates for reusable card and deck structures
- Event listeners for user actions like opening decks, flipping cards, navigating the carousel, and confirming deletion
- Hash-based routing to switch between the home view, deck views, carousel view, and not-found view
- Accessibility basics, including button labels and semantic page regions
- Conventional Commits to keep Git history clearer and more consistent

## Technologies Used

- HTML
- CSS
- JavaScript
- Google Fonts
- SVG assets
- Git and GitHub
- GitHub Pages

## Project Structure

The app is organized into separate files by responsibility:

- `index.html` contains the main page structure and reusable HTML templates.
- `assets/css/` contains component-based styles for the page, cards, gallery, carousel, modal, header, footer, and responsive layout.
- `assets/js/` contains the JavaScript modules for decks, deck views, carousel behavior, modal behavior, color mapping, and main routing.
- `assets/images/` contains image and icon assets used by the app.
- `assets/vendor/` contains third-party vendor styles such as Normalize.css.

## Key Files

- `assets/js/index.js` controls the main app routing and renders the home view.
- `assets/js/deckView.js` renders the open deck view and individual flashcards.
- `assets/js/carousel.js` controls the practice carousel view.
- `assets/js/modal.js` controls the confirmation modal.
- `assets/js/decks.js` stores the flashcard deck data.
- `assets/css/index.css` imports the app’s CSS files.

## What I Learned

This project helped me understand how a front-end app is built from smaller pieces. I learned how HTML, CSS, and JavaScript work together to create an interactive user experience.

I also learned the importance of writing code that is organized and understandable. Using BEM helped me name classes more clearly, JavaScript modules helped me separate responsibilities, and Conventional Commits helped me think more carefully about how I describe changes in Git.

One of the biggest lessons from this project was learning how to move from a static page to an interactive application. Features like the open deck views, carousel navigation, card flipping, and confirmation modal helped me practice real user interaction patterns.

## Future Improvements

Some improvements I would like to add in the future include:

- Allowing users to create new decks
- Allowing users to add new flashcards
- Saving changes with local and/or external storage
- Adding edit functionality for decks and cards
- Improving keyboard navigation for studying cards
- Adding more flashcard categories

## Author

Built by Paul Barrow-Wilkerson as part of TripleTen’s AI-Assisted Software Engineering program.