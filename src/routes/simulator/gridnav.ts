import type { SelectionKind } from './selection.svelte';

export type Direction = 'up' | 'down' | 'left' | 'right';

const attributes: Record<SelectionKind, string> = {
	kingdom: 'data-simulator-kingdom',
	player: 'data-simulator-player',
	card: 'data-simulator-card'
};

/**
 * Grid an item belongs to: the list of cards of its owner, or the group of players of its
 * kingdom. Moves stay within it before reaching for a neighbouring owner.
 */
const grids: Record<SelectionKind, string | null> = {
	kingdom: null,
	player: '[data-simulator-player-group]',
	card: '[role="list"]'
};

/** CSS selector matching the rendered element of a selectable item. */
export function selectorOf(kind: SelectionKind, id: string): string {
	return `[${attributes[kind]}="${CSS.escape(id)}"]`;
}

export function elementOf(kind: SelectionKind, id: string): HTMLElement | null {
	if (typeof document === 'undefined') return null;
	return document.querySelector<HTMLElement>(selectorOf(kind, id));
}

export function rectOf(kind: SelectionKind, id: string): DOMRect | null {
	return elementOf(kind, id)?.getBoundingClientRect() ?? null;
}

export interface GridItem {
	id: string;
	rect: DOMRect;
	grid: Element | null;
}

function isVisible(element: HTMLElement): boolean {
	if (typeof element.checkVisibility === 'function') {
		return element.checkVisibility({ visibilityProperty: true });
	}
	return element.getClientRects().length > 0;
}

/** Every rendered item of the given kind, skipping the ones hidden from view. */
export function visibleItems(kind: SelectionKind): Array<GridItem> {
	if (typeof document === 'undefined') return [];

	const items: Array<GridItem> = [];
	for (const element of document.querySelectorAll<HTMLElement>(`[${attributes[kind]}]`)) {
		const id = element.getAttribute(attributes[kind]);
		if (!id || !isVisible(element)) continue;

		const rect = element.getBoundingClientRect();
		if (rect.width === 0 && rect.height === 0) continue;

		const gridSelector = grids[kind];
		items.push({ id, rect, grid: gridSelector ? element.closest(gridSelector) : null });
	}
	return items;
}

/** Grid of the given item, so that the caller can pass it back to `neighbourInDirection`. */
export function gridOf(kind: SelectionKind, id: string): Element | null {
	const gridSelector = grids[kind];
	if (!gridSelector) return null;
	return elementOf(kind, id)?.closest(gridSelector) ?? null;
}

const centerOf = (start: number, size: number) => start + size / 2;

/**
 * Id of the closest item starting beyond the origin's edge in the given direction. Items
 * sharing the origin's row or column are preferred; when `sameRowOrColumn` is false, items
 * off to the side are considered too, which lets ragged grids change row or column before
 * moving on to another owner.
 */
function closestInDirection(
	origin: DOMRect,
	items: ReadonlyArray<GridItem>,
	direction: Direction,
	sameRowOrColumn: boolean
): string | null {
	const horizontal = direction === 'left' || direction === 'right';

	let best: { id: string; score: number } | null = null;
	for (const { id, rect } of items) {
		const distance = horizontal
			? direction === 'right'
				? rect.left - origin.right
				: origin.left - rect.right
			: direction === 'down'
				? rect.top - origin.bottom
				: origin.top - rect.bottom;
		if (distance < 0) continue;

		if (sameRowOrColumn) {
			const overlaps = horizontal
				? rect.bottom > origin.top && rect.top < origin.bottom
				: rect.right > origin.left && rect.left < origin.right;
			if (!overlaps) continue;
		}

		const misalignment = horizontal
			? Math.abs(centerOf(rect.top, rect.height) - centerOf(origin.top, origin.height))
			: Math.abs(centerOf(rect.left, rect.width) - centerOf(origin.left, origin.width));

		const score = distance + misalignment;
		if (!best || score < best.score) best = { id, score };
	}

	return best?.id ?? null;
}

/**
 * Id of the item an arrow key should select: the closest one in the direction within the
 * same grid, then the closest one sharing the row or column, wherever it is rendered.
 */
export function neighbourInDirection(
	origin: DOMRect,
	grid: Element | null,
	items: ReadonlyArray<GridItem>,
	direction: Direction
): string | null {
	const own = grid ? items.filter((item) => item.grid === grid) : [];

	return (
		closestInDirection(origin, own, direction, false) ??
		closestInDirection(origin, items, direction, true)
	);
}
