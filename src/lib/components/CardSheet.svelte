<script lang="ts" module>
	import * as css from '#lib/styles';
	import { CardSize } from '#lib/styles/cards';
	import {
		cutMarkGap,
		cutMarkLength,
		cutMarkWidth,
		sheetColumnWidthVar,
		sheetColumnsVar,
		sheetHeight,
		sheetRowHeightVar,
		sheetRowsVar,
		sheetWidth
	} from '#lib/cardsheets';

	const styles = css.styles({
		sheet: {
			// On screen the cards belong to the listing, so the sheet is not part of its layout.
			display: 'contents',
			'@media print': {
				display: 'grid',
				position: 'relative',
				// The rows of a full sheet are reserved even on the last, partially filled sheet, so
				// that its cards sit where the matching card backs are printed.
				gridTemplateColumns: `repeat(var(${sheetColumnsVar}), var(${sheetColumnWidthVar}))`,
				gridTemplateRows: `repeat(var(${sheetRowsVar}), var(${sheetRowHeightVar}))`,
				justifyContent: 'center',
				alignContent: 'center',
				gap: 0,
				width: `${sheetWidth}mm`,
				height: `${sheetHeight}mm`,
				overflow: 'hidden',
				breakInside: 'avoid',
				breakAfter: 'page',
				backgroundColor: css.palette.white,
				// Pin the em-based card sizes to their physical size, whatever the browser's
				// default font size is.
				fontSize: `${1 / CardSize.mmPerEm}mm`,
				printColorAdjust: 'exact',
				WebkitPrintColorAdjust: 'exact',
				'&:last-child': {
					breakAfter: 'auto'
				}
			}
		},
		marks: {
			display: 'none',
			fill: css.palette.somber,
			'@media print': {
				display: 'block',
				position: 'absolute',
				top: 0,
				left: 0
			}
		}
	});
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { CardSheetLayout } from '#lib/cardsheets';

	interface Props {
		layout: CardSheetLayout;
		/** Number of cards on the sheet, so that a partially filled last sheet is marked too. */
		cardCount: number;
		children: Snippet;
	}

	const { layout, cardCount, children }: Props = $props();

	/** Columns and rows taken by the cards on this sheet; the last sheet is usually not full. */
	const usedColumns = $derived(Math.min(layout.columns, cardCount));
	const rows = $derived(Math.ceil(cardCount / layout.columns));
	const blockWidth = $derived(usedColumns * layout.size.width);
	/** Cut marks follow the cards, which start at the first row and column of a full sheet. */
	const blockY = $derived(layout.y);
	const blockHeight = $derived(rows * layout.size.height);

	const verticalCuts = $derived(
		Array.from({ length: usedColumns + 1 }, (_, index) => layout.x + index * layout.size.width)
	);
	const horizontalCuts = $derived(
		Array.from({ length: rows + 1 }, (_, index) => blockY + index * layout.size.height)
	);
</script>

<div
	class={styles.sheet}
	style={`${sheetColumnsVar}: ${layout.columns}; ${sheetColumnWidthVar}: ${layout.size.width}mm; ${sheetRowsVar}: ${layout.rows}; ${sheetRowHeightVar}: ${layout.size.height}mm`}
>
	{@render children()}

	<svg
		class={styles.marks}
		aria-hidden="true"
		width={`${sheetWidth}mm`}
		height={`${sheetHeight}mm`}
		viewBox={`0 0 ${sheetWidth} ${sheetHeight}`}
	>
		{#each verticalCuts as cut (cut)}
			<rect
				x={cut - cutMarkWidth / 2}
				y={blockY - cutMarkGap - cutMarkLength}
				width={cutMarkWidth}
				height={cutMarkLength}
			/>
			<rect
				x={cut - cutMarkWidth / 2}
				y={blockY + blockHeight + cutMarkGap}
				width={cutMarkWidth}
				height={cutMarkLength}
			/>
		{/each}
		{#each horizontalCuts as cut (cut)}
			<rect
				x={layout.x - cutMarkGap - cutMarkLength}
				y={cut - cutMarkWidth / 2}
				width={cutMarkLength}
				height={cutMarkWidth}
			/>
			<rect
				x={layout.x + blockWidth + cutMarkGap}
				y={cut - cutMarkWidth / 2}
				width={cutMarkLength}
				height={cutMarkWidth}
			/>
		{/each}
	</svg>
</div>

<style>
	@media print {
		@page {
			size: A4;
			margin: 0;
		}

		/* Sheets fill the whole page, so the document width does not apply to them. */
		:global(main > div) {
			max-width: none !important;
		}
	}
</style>
