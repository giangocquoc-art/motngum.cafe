# Patch T13 — Accessibility + UX Polish

Patch T13 hardens the five-theme experience for keyboard, screen-reader, touch,
reduced-motion and high-contrast users without flattening the art direction.

## What changed

- Theme picker now opens with focus on the currently selected theme.
- Arrow keys + Home/End navigate both the modal selector and the Studio theme rail.
- Theme cards use a single roving tab stop so keyboard navigation stays concise.
- Theme changes are announced through a polite live region.
- Theme quick switch declares that it opens a dialog.
- Mobile navigation now:
  - moves focus into the menu when opened,
  - traps Tab/Shift+Tab inside the open menu,
  - returns focus to the hamburger on Escape,
  - closes from a pointer backdrop,
  - keeps background scrolling locked.
- Dialog close text is localized to Vietnamese for screen readers.
- Theme-aware two-layer focus rings remain visible on both light surfaces and dark heroes.
- Tech helper copy receives a higher-contrast treatment.
- Touch devices no longer keep hover transforms as sticky states.
- Added forced-colors support for system high-contrast modes.
- Expanded reduced-motion handling for selector/nav/dialog transitions.

## Verification scope

The patch is designed to apply directly on top of the T12 source. Static
TypeScript/TSX transpilation, CSS brace checks and `git diff --check` are run
before export. A full browser accessibility audit still belongs in Patch T15,
where the finished site can be tested as one integrated build.
