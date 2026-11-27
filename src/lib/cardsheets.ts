import type { CardSize } from '#lib/styles/cards';

/** Dimensions of an A4 sheet, in millimetres. */
export const sheetWidth = 210;
export const sheetHeight = 297;

/** Width of the gutter printed around the block of cards, in millimetres. */
export const sheetGutter = 4;

/** Width of the cut marks, in millimetres. */
export const cutMarkWidth = 0.3;

/** Distance between the cards and the cut marks, in millimetres. */
export const cutMarkGap = 1;

/** Length of the cut marks: half of the gutter, so that they fit in it. */
export const cutMarkLength = sheetGutter / 2;

/** CSS custom property holding the number of columns of cards on a printed sheet. */
export const sheetColumnsVar = '--card-sheet-columns';

/** CSS custom property holding the width of a column of cards on a printed sheet. */
export const sheetColumnWidthVar = '--card-sheet-column-width';

/** CSS custom property holding the number of rows of cards on a printed sheet. */
export const sheetRowsVar = '--card-sheet-rows';

/** CSS custom property holding the height of a row of cards on a printed sheet. */
export const sheetRowHeightVar = '--card-sheet-row-height';

export interface CardSheetLayout {
	readonly size: CardSize;
	readonly columns: number;
	readonly rows: number;
	/** Width of the block of cards, in millimetres. */
	readonly width: number;
	/** Height of the block of cards, in millimetres. */
	readonly height: number;
	/** Left edge of the block of cards on the sheet, in millimetres. */
	readonly x: number;
	/** Top edge of the block of cards on the sheet, in millimetres. */
	readonly y: number;
	/** Number of cards on a full sheet. */
	readonly count: number;
}

/**
 * The way cards of the given size are laid out on an A4 sheet: packed with no margins between
 * them and centred on the sheet, so that the printed fronts and backs line up.
 */
export function getCardSheetLayout(size: CardSize): CardSheetLayout {
	const columns = Math.floor((sheetWidth - 2 * sheetGutter) / size.width);
	const rows = Math.floor((sheetHeight - 2 * sheetGutter) / size.height);
	const width = columns * size.width;
	const height = rows * size.height;

	return {
		size,
		columns,
		rows,
		width,
		height,
		x: (sheetWidth - width) / 2,
		y: (sheetHeight - height) / 2,
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
