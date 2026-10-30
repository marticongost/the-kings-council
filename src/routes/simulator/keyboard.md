/plan Add support for shortcuts and keyboard navigation in /simulator.

## Keyboard navigation

Keyboard navigation allows the user to move across the different elements of the interface, selecting them (either with single or multiple selection).

The following items can be selected:

- Kingdoms (including the independent players panel, which functions as a kingdom for this purpose)
- Players
- Card pills

These elements can be selected by clicking them (regular browser focus), or using custom navigation shortcuts, which changes depending on which element is currently selected:

- When the page as a whole is selected (e.g. by clicking the background)
  - <k>: Selects all kingdoms
  - <p>: Selects all players
  - <c>: Selects all card pills
- When 1+ kingdoms are selected:
  - <Backspace>: Selects the page
  - <p>: Selects all players in the selected kingdoms
  - <c>: Selects all card pills in the selected kingdoms
  - <a>: Selects all kingdoms
  - <Left>: Selects the previous kingdom (if there is none, cycle to the last). If multiple kingdoms are selected, count from the first kingdom in the list.
  - <Right>: Selects the next kingdom (if there is none, cycle to the first). If multiple kingdoms are selected, count from the first kingdom in the list.
  - <Up>: Selects the last player of the selected kingdoms
  - <Down>: Selects the first player of the selected kingdoms
  - <Home>: Selects the first kingdom
  - <End>: Selects the last kingdom
- When 1+ players are selected:
  - <Backspace>: Selects the page
  - <k>: Selects all parent kingdoms of the selected players
  - <c>: Selects all card pills of the selected players
  - <a>: Selects all players across the kingdoms of all selected players
  - <Left>: Selects the previous kingdom (if there is none, cycle to the last). If multiple kingdoms are selected, count from the first kingdom in the list.
  - <Right>: Selects the next kingdom (if there is none, cycle to the first). If multiple kingdoms are selected, count from the first kingdom in the list.
  - <Up>: Selects the previous player in the kingdoms of the selected players. If multiple players are selected, count from the first player. If there is no previous player, cycle to the first.
  - <Down>: Selects the next player in the kingdoms of the selected players. If multiple players are selected, count from the first player. If there is no next player, cycle to the last.
  - <Home>: Selects the first player in the kingdoms of the selected players.
  - <End>: Selects the last player in the kingdoms of the selected players.
- When 1+ card pills are selected:
  - <Backspace>: Selects the page
  - <k>: Selects the kingdoms that the selected card pills belong to (either directly or via their owning player)
  - <p>: Selects the players owning any of the selected card pills
  - <a>: Selects all the card pills of the players that own any of the selected card pills
  - <Left>: Selects the previous kingdom (if there is none, cycle to the last). If multiple kingdoms are selected, count from the first kingdom in the list.
  - <Right>: Selects the next kingdom (if there is none, cycle to the first). If multiple kingdoms are selected, count from the first kingdom in the list.
  - <Up>: Selects the previous card pill, relative to the selected one (if there is none, cycle to the last). If multiple card pills are selected, count from the first.
  - <Down>: Selects the next card pill, relative to the selected one (if there is none, cycle to the first). If multiple card pills are selected, count from the first.
  - <Home>: Selects the first card pill of the selected kingdoms / players
  - <End>: Selects the last card pill of the selected kingdoms / players
  - <f> {type}: Filters the selected cards, including only those matching the indicated type (expressed as a second press - see the "Card type shortcuts" section).

## Card type shortcuts

Some navigation or action shortcuts require a card type key. These are as follows:

- t: Tactic
- v: Visible asset
- h: Hidden asset
- p: Personal objective
- c: Collective objective
- K: Office card (king)
- M: Office card (marshal)
- B: Office card (bishop)
- T: Office card (treasurer)
- C: Office card (Chancellor)
- S: Office card (Spy Master)
- J: Office card (Jester)

There are also these _non concrete_ selectors, which work when selecting elements
already in place, but won't be acceptable when specifying new elements to bring into
play (e.g. via the "a" shortcut presented later):

- a: Asset (any)
- o: Office card (any)

## Keyboard actions

Dependent on the selected element.

- <Delete>: Delete the selected player(s) or kingdom(s)
- <d>: Discard the selected card pills, returning them to their discard pile
- <r>: Return the selected card pills to their deck
- <a> [amount] {type}: Acquire [amount] cards of the given {type}. [amount] is optional and indicated by a press of a numeric key - if omitted, one is assumed; if the amount is excessive, it is trimmed to what's possible. {type} has to be a _concrete_ card type shortcut.

If multiple elements are selected, the execution is executed for each of them (e.g).

## Composition

As indicated, some commands take multiple key presses. In that case, the sequence can be
stopped at any point by pressing <Escape>. The UI should present cues to the user to
indicate a follow up is expected.

## Visual cues

Show a translucent panel in the bottom right corner listing contextual shortcuts, changing as the selection changes.

## Examples

With the root selected, add 3 tactics cards to all players in the game:
  <p> <a> <3> <t>

With a kingdom selected, discard all player cards:
  <p> <c> <d>

With a player selected, return all its assets to their deck:
<c> <f> <a> <r>

## Implementation decisions

The following details resolve ambiguities in the specification above.

- **Clicking:** a plain click replaces the selection with the clicked element;
  <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+click toggles it into or out of the selection. Clicking
  a card pill also opens its card preview; <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+click only
  changes the selection.
- **Keyboard navigation** always replaces the selection with a single kind of element.
  Mixed selections can only be created with <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+click. For
  mixed selections, navigation follows the card-pill rules first, then players, then
  kingdoms, while actions apply to every selected kind.
- **`<a>` precedence:** when players or kingdoms are selected, <kbd>a</kbd> starts the
  acquisition command (as the examples require). It only expands the selection to the
  cards of the owning players when card pills alone are selected. To expand a player
  selection to all players of their kingdoms, use <kbd>k</kbd> followed by <kbd>p</kbd>.
- **The independents panel** is a pseudo-kingdom placed first in the kingdom order. It
  cannot be deleted or receive acquired cards; its players can be targeted individually
  with <kbd>p</kbd> or by clicking them.
- **Acquisition** draws non-office cards from the matching face-down deck (reshuffling
  its discards when empty) and puts them in the selected players' hands or the selected
  kingdoms' card areas. Offices are never duplicated: the kingdom's single copy is
  assigned to the target player (or returned to the kingdom reserve). The amount defaults
  to one, accepts a sequence of digits and is trimmed to what the decks can provide.
- **Filtering** with no matches clears the selection (back to the page).
- **Discarding or returning** card pills clears their selection, as the pills are no
  longer shown where they were.
- **Up/Down** wrap at both ends, like Left/Right.
- **Persistence:** the selection is transient and is not stored in the simulator
  snapshot.
