import type { CardSize } from '#lib/styles/cards';

/** Dimensions of an A4 sheet, in millimetres. */
export const sheetWidth = 210;
export const sheetHeight = 297;

/** Margin around the block of cards, reserved for the cut marks, in millimetres. */
export const sheetGutter = 4;

/**
 * Gap between adjacent cards, in millimetres. Each edge of every card is marked in it, and the
 * card backs are bled by half of it beyond their edges, so a cut made anywhere in the gap still
 * leaves complete cards.
 */
export const cardGap = 2;

/** Width of the cut marks, in millimetres. */
export const cutMarkWidth = 0.3;

/** Distance between the cards and the cut marks, in millimetres. */
export const cutMarkGap = 1;

/** Length of the cut marks, in millimetres. */
export const cutMarkLength = sheetGutter / 2;

/** CSS custom property holding the number of columns of cards on a printed sheet. */
export const sheetColumnsVar = '--card-sheet-columns';

/** CSS custom property holding the width of a column of cards on a printed sheet. */
export const sheetColumnWidthVar = '--card-sheet-column-width';

/** CSS custom property holding the gap between the columns of cards on a printed sheet. */
export const sheetColumnGapVar = '--card-sheet-column-gap';

/** CSS custom property holding the number of rows of cards on a printed sheet. */
export const sheetRowsVar = '--card-sheet-rows';

/** CSS custom property holding the height of a row of cards on a printed sheet. */
export const sheetRowHeightVar = '--card-sheet-row-height';

/** CSS custom property holding the gap between the rows of cards on a printed sheet. */
export const sheetRowGapVar = '--card-sheet-row-gap';

export interface CardSheetLayout {
	readonly size: CardSize;
	readonly columns: number;
	readonly rows: number;
	/** Gap between adjacent cards, in millimetres. */
	readonly gap: number;
	/** Distance between the left edges of adjacent columns, in millimetres. */
	readonly pitchX: number;
	/** Distance between the top edges of adjacent rows, in millimetres. */
	readonly pitchY: number;
	/** Left edge of the first card on the sheet, in millimetres. */
	readonly x: number;
	/** Top edge of the first card on the sheet, in millimetres. */
	readonly y: number;
	/** Number of cards on a full sheet. */
	readonly count: number;
}

/**
 * The way cards of the given size are laid out on an A4 sheet: evenly spaced and centred on the
 * sheet including the half gap that the outer cards are bled into, so that the printed fronts
 * and backs line up.
 */
export function getCardSheetLayout(size: CardSize): CardSheetLayout {
	const pitchX = size.width + cardGap;
	const pitchY = size.height + cardGap;
	const columns = Math.floor((sheetWidth - 2 * sheetGutter) / pitchX);
	const rows = Math.floor((sheetHeight - 2 * sheetGutter) / pitchY);

	return {
		size,
		columns,
		rows,
		gap: cardGap,
		pitchX,
		pitchY,
		x: (sheetWidth - columns * pitchX) / 2 + cardGap / 2,
		y: (sheetHeight - rows * pitchY) / 2 + cardGap / 2,
		count: columns * rows
	};
}

/** Splits the cards into consecutive groups that each fill one printed sheet. */
export function splitIntoSheets<T>(cards: ReadonlyArray<T>, perSheet: number): Array<Array<T>> {
	const sheets: Array<Array<T>> = [];
	for (let start = 0; start < cards.length; start += perSheet) {
		sheets.push(cards.slice(start, start + perSheet));
	}
	return sheets;
}
