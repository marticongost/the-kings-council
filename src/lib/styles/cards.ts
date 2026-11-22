import type { CSSObject } from '@emotion/css/create-instance';
import { isFateCardType, type CardType } from '#lib/models/cards';
import { spacing } from './spacing';
import * as viewport from './viewport';

export class CardSize {
	readonly width: number;
	readonly height: number;

	/** Conversion factor from millimetres to em at the document's base font size (16px). */
	static readonly mmPerEm = 96 / 25.4 / 16;

	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
	}

	/** Card width expressed in em, so it scales with the inherited font size. */
	get widthEm(): number {
		return this.width * CardSize.mmPerEm;
	}

	cw(percent: number) {
		return `${(this.width * percent) / 100}mm`;
	}

	/** A percentage of the card width expressed in em. */
	cwEm(percent: number) {
		return `${((this.width * percent) / 100) * CardSize.mmPerEm}em`;
	}

	dimensions(): { width: string; height: string } {
		return { width: `${this.width}mm`, height: `${this.height}mm` };
	}

	/** Card dimensions expressed in em, so they scale with the inherited font size. */
	emDimensions(): { width: string; height: string } {
		return {
			width: `${this.width * CardSize.mmPerEm}em`,
			height: `${this.height * CardSize.mmPerEm}em`
		};
	}
}

export const standard = new CardSize(63, 88);
export const mini = new CardSize(63, 41);
/** Fate cards (crises and events) need more room, so they use a tarot-sized card. */
export const tarot = new CardSize(70, 120);

/** The size of a card's front and back. */
export function getCardSize(type: CardType): CardSize {
	return isFateCardType(type) ? tarot : standard;
}

/** CSS custom property holding the width of the column that holds a card in a listing. */
export const listingColumnWidth = '--card-listing-column-width';

/**
 * CSS custom property holding the card width in em (as a unitless number), used to scale the
 * card so it fills the viewport in the xs viewport size.
 */
export const listingEmWidth = '--card-listing-em-width';

/**
 * Number of cards in each row of a listing at each viewport size. The viewport sizes are wide
 * enough to fit the widest card (a fate card) at each of these counts.
 */
const columnsPerRow: Record<viewport.ViewportSizeId, number> = {
	xs: 1,
	sm: 2,
	md: 3,
	lg: 4,
	xl: 5
};

const columns = (size: viewport.ViewportSizeId): string =>
	`repeat(${columnsPerRow[size]}, var(${listingColumnWidth}))`;

/**
 * Layout of a listing of cards. The listing is centred on the document, but is allowed to grow
 * beyond it so that the intended number of cards fits in each row at every viewport size. Cards
 * are left aligned within a row, so a trailing row that is not full starts at the same edge.
 */
export const listing: CSSObject = {
	display: 'grid',
	justifyItems: 'start',
	gap: spacing.md,
	width: 'max-content',
	maxWidth: 'calc(100vw - var(--scrollbar-width, 0px))',
	position: 'relative',
	left: '50%',
	transform: 'translateX(-50%)',
	gridTemplateColumns: columns('xs'),
	...viewport.xs.exactly().then({
		// The single card fills the viewport (leaving a small margin on each side) by scaling
		// the card's font size, which scales every em-based dimension of the card uniformly.
		width: `calc(100vw - var(--scrollbar-width, 0px) - 2 * ${spacing.md})`,
		maxWidth: 'none',
		gridTemplateColumns: 'minmax(0, 1fr)',
		'& > *': {
			fontSize: `calc((100vw - var(--scrollbar-width, 0px) - 2 * ${spacing.md}) / var(${listingEmWidth}, ${standard.widthEm}))`
		}
	}),
	...viewport.sm.orLarger().then({
		// Keep a small gap between the listing and the viewport edges once there is room for it.
		maxWidth: `calc(100vw - var(--scrollbar-width, 0px) - 2 * ${spacing.sm})`,
		gridTemplateColumns: columns('sm')
	}),
	...viewport.md.orLarger().then({ gridTemplateColumns: columns('md') }),
	...viewport.lg.orLarger().then({ gridTemplateColumns: columns('lg') }),
	...viewport.xl.orLarger().then({ gridTemplateColumns: columns('xl') })
};
