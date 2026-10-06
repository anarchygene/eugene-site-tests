# <n>-site specification

## Conventions
- Sections with ids #hero #about #skills #projects #repos #contact all exist.
- There is no horizontal scrolling at a viewport width of 375px.
- #repos lists public GitHub repositories as cards, or displays a plain message
  if there are no repositories or the request fails.
- #hero and #contact contain email, GitHub, and LinkedIn links.

## Issue #1: dark-mode toggle
- A button in the navigation toggles a 'dark' class on <body>.
- The choice is retained for the browser session.
