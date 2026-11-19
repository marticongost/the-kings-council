import { mini, standard, tarot, type CardSize } from '#lib/styles/cards';

/**
 * The names of the card back artwork in `static/svg/card-back-backgrounds`, one per card type
 * and sub-type. Keep this list in sync with the files in that directory.
 */
export const cardBackTypes = [
	'asset',
	'capability',
	'collective-goal',
	'fate',
	'hidden-asset',
	'house',
	'law',
	'office',
	'personal-goal',
	'tactic'
] as const;

export type CardBackType = (typeof cardBackTypes)[number];

const cardBackTypeSet: ReadonlySet<string> = new Set(cardBackTypes);

export function isCardBackType(value: string): value is CardBackType {
	return cardBackTypeSet.has(value);
}

/** The artwork of a card back. */
export function getCardBackUrl(type: CardBackType): string {
	return `/svg/card-back-backgrounds/${type}.svg`;
}

/** Dimensions of an A4 sheet, in millimetres. */
export const sheetWidth = 210;
export const sheetHeight = 297;

/** Width of the bleed printed around the block of cards, in millimetres. */
export const sheetGutter = 4;

/** Capability cards are mini, fate cards are tarot-sized, and everything else is standard. */
export function getCardBackSize(type: CardBackType): CardSize {
	switch (type) {
		case 'capability':
			return mini;
		case 'fate':
			return tarot;
		default:
			return standard;
	}
}

export interface CardBackSheet {
	readonly size: CardSize;
	readonly columns: number;
	readonly rows: number;
	/** Width of the block of cards, in millimetres. */
	readonly width: number;
	/** Height of the block of cards, in millimetres. */
	readonly height: number;
	readonly count: number;
}

/** The way the backs of a card type are laid out on a single A4 sheet. */
export function getCardBackSheet(type: CardBackType): CardBackSheet {
	const size = getCardBackSize(type);
	const columns = Math.floor((sheetWidth - 2 * sheetGutter) / size.width);
	const rows = Math.floor((sheetHeight - 2 * sheetGutter) / size.height);

	return {
		size,
		columns,
		rows,
		width: columns * size.width,
		height: rows * size.height,
		count: columns * rows
	};
}
