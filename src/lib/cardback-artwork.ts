import { namespaceSvgIds } from '#lib/assets/svg';
import type { CardBackType } from '#lib/cardbacks';

// Load the card back artwork as raw SVG text so it can be inlined into the printable sheet.
// Inlining renders the artwork in the page's own document, where webfonts and variable font
// settings behave normally, unlike SVGs loaded as external images.
const cardBackSvgs = import.meta.glob('/static/svg/card-back-backgrounds/*.svg', {
	query: '?raw',
	import: 'default',
	eager: true
});

const cardBackArtwork = new Map<CardBackType, string>();

for (const [key, value] of Object.entries(cardBackSvgs)) {
	const type = key.replace('/static/svg/card-back-backgrounds/', '').replace(/\.svg$/, '');
	cardBackArtwork.set(type as CardBackType, namespaceSvgIds(innerSvg(value), `card-back-${type}`));
}

/** The content between the outer `<svg>` tags, for use inside a nested `<svg>` or `<symbol>`. */
function innerSvg(raw: string): string {
	const opening = /<svg\b(?:[^>"']|"[^"]*"|'[^']*')*>/.exec(raw);
	if (!opening) return '';
	const close = raw.lastIndexOf('</svg>');
	return raw.slice(opening.index + opening[0].length, close);
}

/** The inlined artwork of a card back, with its ids namespaced to avoid collisions. */
export function getCardBackArtwork(type: CardBackType): string {
	return cardBackArtwork.get(type) ?? '';
}
