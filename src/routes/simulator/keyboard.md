# Simulator keyboard shortcuts

The simulator can be operated entirely with the keyboard. A translucent panel in the
bottom-right corner shows the shortcuts available for the current selection, as well as
the keys a multi-key command is waiting for.

## Selecting elements

You can select three kinds of elements:

- **Kingdoms**, including the independent players panel, which behaves like a kingdom.
- **Players**.
- **Card pills**.

Click an element to select it. Hold <kbd>Ctrl</kbd> (or <kbd>Cmd</kbd> on macOS) while
clicking to add or remove elements and build a multiple selection.

Clicking a card pill also opens its card preview. <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+click
only changes the selection.

Click the page background, or press <kbd>Backspace</kbd>, to clear the selection and
return to the page.

Keyboard navigation replaces the current selection with a single kind of element. Use
<kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+click to combine kingdoms, players or cards. Actions then
apply to every selected element they are relevant to.

## Navigation

### Page selected

| Key          | Action                |
| ------------ | --------------------- |
| <kbd>k</kbd> | Select all kingdoms   |
| <kbd>p</kbd> | Select all players    |
| <kbd>c</kbd> | Select all card pills |

### Kingdoms selected

| Key                              | Action                                                    |
| -------------------------------- | --------------------------------------------------------- |
| <kbd>Backspace</kbd>             | Select the page                                           |
| <kbd>p</kbd>                     | Select the players of the selected kingdoms               |
| <kbd>c</kbd>                     | Select the card pills in the selected kingdoms            |
| <kbd>←</kbd> / <kbd>→</kbd>      | Select the previous or next kingdom, wrapping at the ends |
| <kbd>↑</kbd>                     | Select the last player of the selected kingdoms           |
| <kbd>↓</kbd>                     | Select the first player of the selected kingdoms          |
| <kbd>Home</kbd> / <kbd>End</kbd> | Select the first or last kingdom                          |

When several kingdoms are selected, <kbd>←</kbd>/<kbd>→</kbd> move from the first
selected kingdom in the list.

### Players selected

| Key                              | Action                                                             |
| -------------------------------- | ------------------------------------------------------------------ |
| <kbd>Backspace</kbd>             | Select the page                                                    |
| <kbd>k</kbd>                     | Select the kingdoms of the selected players                        |
| <kbd>c</kbd>                     | Select the card pills of the selected players                      |
| <kbd>←</kbd> / <kbd>→</kbd>      | Select the previous or next kingdom, wrapping at the ends          |
| <kbd>↑</kbd> / <kbd>↓</kbd>      | Select the previous or next player within their kingdoms, wrapping |
| <kbd>Home</kbd> / <kbd>End</kbd> | Select the first or last player within their kingdoms              |

When several players are selected, the arrows move from the first selected player in the
list.

### Card pills selected

| Key                              | Action                                                                  |
| -------------------------------- | ----------------------------------------------------------------------- |
| <kbd>Backspace</kbd>             | Select the page                                                         |
| <kbd>k</kbd>                     | Select the kingdoms the selected cards belong to                        |
| <kbd>p</kbd>                     | Select the players who own any of the selected cards                    |
| <kbd>←</kbd> / <kbd>→</kbd>      | Select the previous or next kingdom, wrapping at the ends               |
| <kbd>↑</kbd> / <kbd>↓</kbd>      | Select the previous or next card pill among the owners' cards, wrapping |
| <kbd>Home</kbd> / <kbd>End</kbd> | Select the first or last card pill among the owners' cards              |
| <kbd>f</kbd> then a type key     | Keep only the selected cards matching that type                         |

When several cards are selected, the arrows move from the first selected card in the
list. Cards without an owner (available laws, market cards and discard piles) are navigated
across all visible card pills, and <kbd>k</kbd>/<kbd>p</kbd> have no effect on them.

## Card type keys

Card type keys are used by filtering and acquisition.

| Key          | Type                     |
| ------------ | ------------------------ |
| <kbd>t</kbd> | Tactic                   |
| <kbd>v</kbd> | Visible asset            |
| <kbd>h</kbd> | Hidden asset             |
| <kbd>p</kbd> | Personal objective       |
| <kbd>c</kbd> | Collective objective     |
| <kbd>K</kbd> | Office: King             |
| <kbd>M</kbd> | Office: Marshal          |
| <kbd>B</kbd> | Office: Bishop           |
| <kbd>T</kbd> | Office: Treasurer        |
| <kbd>C</kbd> | Office: Chancellor       |
| <kbd>S</kbd> | Office: Spy Master       |
| <kbd>J</kbd> | Office: Jester           |
| <kbd>a</kbd> | Any asset (filter only)  |
| <kbd>o</kbd> | Any office (filter only) |

Office keys are uppercase. <kbd>a</kbd> and <kbd>o</kbd> can be used to filter
existing cards, but not to acquire new ones.

## Actions

| Key                                | Action                                           |
| ---------------------------------- | ------------------------------------------------ |
| <kbd>Delete</kbd>                  | Delete the selected players and kingdoms         |
| <kbd>d</kbd>                       | Discard the selected card pills                  |
| <kbd>r</kbd>                       | Return the selected card pills to their deck     |
| <kbd>a</kbd> [amount] type         | Acquire cards of the given type                  |
| <kbd>+</kbd> [amount] target       | Increase the selected resources or kingdom stats |
| <kbd>-</kbd> [amount] target       | Decrease the selected resources or kingdom stats |
| <kbd>=</kbd> amount target         | Set the selected resources or kingdom stats      |
| <kbd>n</kbd> [amount] <kbd>k</kbd> | Create new kingdoms                              |
| <kbd>n</kbd> [amount] <kbd>p</kbd> | Create new players                               |

The independents panel behaves like a kingdom for navigation, but it cannot be deleted.
Discarding or returning cards clears their selection, since the pills no longer appear
where they were.

### Acquiring cards

Select one or more players and/or kingdoms, then press <kbd>a</kbd>. Enter an optional
amount and a concrete card type key:

```text
a → 3 → t    acquire 3 tactics
a → v        acquire 1 visible asset
```

Cards come from the matching face-down deck. When that deck runs out, its discard pile is
shuffled back into it, and the amount is reduced to what is available. Selected players
receive the cards in their hand; selected kingdoms receive them in their card area.

Offices are unique to each kingdom. Acquiring an office for a player assigns that
kingdom's copy to them, and acquiring it for a kingdom returns it to the kingdom's
reserve.

The independents panel has no card area, so acquire cards for its players individually.

When only card pills are selected, <kbd>a</kbd> selects every card pill of the players
who own the selected cards. To expand a player selection to all players of their
kingdoms, press <kbd>k</kbd> and then <kbd>p</kbd>.

### Changing resources and kingdom stats

Select players to change their resources, kingdoms to change their stats, or both.

Resources:

| Key          | Resource |
| ------------ | -------- |
| <kbd>p</kbd> | Power    |
| <kbd>g</kbd> | Gold     |
| <kbd>s</kbd> | Strength |
| <kbd>f</kbd> | Faith    |
| <kbd>i</kbd> | Intrigue |
| <kbd>v</kbd> | Favour   |
| <kbd>P</kbd> | Prestige |

Kingdom stats:

| Key          | Stat      |
| ------------ | --------- |
| <kbd>s</kbd> | Stability |
| <kbd>w</kbd> | Wealth    |
| <kbd>m</kbd> | Might     |
| <kbd>g</kbd> | Grace     |

Use <kbd>+</kbd> or <kbd>-</kbd> with an optional amount and a target key, or
<kbd>=</kbd> with an amount and a target key:

```text
+ → 2 → g    add 2 gold
- → 4 → w    remove 4 wealth
= → 0 → P    set prestige to 0
```

<kbd>P</kbd> is Shift+P; <kbd>p</kbd> alone means Power. Press <kbd>a</kbd> as the target
to change every resource or stat available to the selection.

When players and kingdoms are selected together, each key changes every target it is
defined for: for example, <kbd>s</kbd> changes both Strength and Stability. Resources
never drop below zero, and kingdom stats stay between 1 and 5. <kbd>=</kbd> requires an
amount; without one, the command is ignored.

### Creating kingdoms and players

Press <kbd>n</kbd>, enter an optional amount, and finish with a target key:

```text
n → k          create 1 kingdom
n → 3 → k      create 3 kingdoms
n → 2 → p      create 2 players
```

<kbd>n</kbd> works from any selection. New kingdoms are added at the end of the list, and
new players join the selected kingdoms; when no kingdom is selected, they are created as
independent players. The independents panel is not a kingdom for this shortcut, so
selecting it creates independent players too. The amount applies to each selected
kingdom, so <kbd>n</kbd> <kbd>2</kbd> <kbd>p</kbd> with two kingdoms selected creates two
players in each of them.

Players are created exactly like the add buttons in the panels: they receive the starting
resources, a house, three tactics and one objective of each kind, drawn from the decks.

The newly created kingdoms or players become the selection, so creation commands can be
chained. For example, create a kingdom and then two players in it:

```text
n → k → n → 2 → p
```

## Composing shortcuts

Some actions need several keys. Press them in sequence; the cue panel shows what is
expected next.

Press <kbd>Esc</kbd> at any point to cancel the sequence. The sequence stays pending
until it is completed or cancelled; it does not time out. Modifier keys such as
<kbd>Shift</kbd>, <kbd>Ctrl</kbd>, <kbd>Alt</kbd> and <kbd>Meta</kbd> do not cancel it;
they remain available for uppercase shortcuts such as <kbd>P</kbd>.

## Examples

With the page selected, add 3 tactics to every player in the game:

```text
p → a → 3 → t
```

With a kingdom selected, discard all player cards in it:

```text
p → c → d
```

With a player selected, return their assets to their deck:

```text
c → f → a → r
```

With a player selected, add 2 gold to them:

```text
+ → 2 → g
```

With a kingdom selected, set all its stats to 4:

```text
= → 4 → a
```
