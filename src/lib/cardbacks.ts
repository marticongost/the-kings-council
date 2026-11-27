import { getCardSheetLayout, type CardSheetLayout } from '#lib/cardsheets';
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

/** Human-readable title of every card back type, for menus and headings. */
export const cardBackTypeTitles: Record<CardBackType, string> = {
	asset: 'Actiu visible',
	capability: 'Targeta de capacitat',
	'collective-goal': 'Objectiu col·lectiu',
	fate: 'Destí',
	'hidden-asset': 'Actiu ocult',
	house: 'Casa',
	law: 'Llei',
	office: 'Càrrec',
	'personal-goal': 'Objectiu personal',
	tactic: 'Tàctica'
};

const cardBackTypeSet: ReadonlySet<string> = new Set(cardBackTypes);

export function isCardBackType(value: string): value is CardBackType {
	return cardBackTypeSet.has(value);
}

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

/** The way the backs of a card type are laid out on a single A4 sheet. */
export function getCardBackSheet(type: CardBackType): CardSheetLayout {
	return getCardSheetLayout(getCardBackSize(type));
}
