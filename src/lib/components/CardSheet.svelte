<script lang="ts" module>
	import * as css from '#lib/styles';
	import { CardSize } from '#lib/styles/cards';
	import {
		cutMarkGap,
		cutMarkLength,
		cutMarkWidth,
		sheetColumnGapVar,
		sheetColumnWidthVar,
		sheetColumnsVar,
		sheetHeight,
		sheetRowGapVar,
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
				columnGap: `var(${sheetColumnGapVar})`,
				rowGap: `var(${sheetRowGapVar})`,
				justifyContent: 'center',
				alignContent: 'center',
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

	/** Cards fill each sheet in rows, so the last row and the last column can be short. */
	const columnCardCounts = $derived(
		Array.from(
			{ length: usedColumns },
			(_, column) => Math.floor((cardCount - 1 - column) / layout.columns) + 1
		)
	);
	const rowCardCounts = $derived(
		Array.from({ length: rows }, (_, row) =>
			Math.min(layout.columns, cardCount - row * layout.columns)
		)
	);

	/**
	 * Both edges of every card, so that each gap between cards is marked once per card edge and
	 * the marks line up exactly with the cards. `bottom` and `right` are where the marks on the
	 * far side of the sheet belong.
	 */
	const verticalMarks = $derived(
		columnCardCounts.flatMap((columnCards, column) => {
			const left = layout.x + column * layout.pitchX;
			const bottom = layout.y + (columnCards - 1) * layout.pitchY + layout.size.height;

			return [
				{ x: left, bottom },
				{ x: left + layout.size.width, bottom }
			];
		})
	);
	const horizontalMarks = $derived(
		rowCardCounts.flatMap((rowCards, row) => {
			const top = layout.y + row * layout.pitchY;
			const right = layout.x + (rowCards - 1) * layout.pitchX + layout.size.width;

			return [
				{ y: top, right },
				{ y: top + layout.size.height, right }
			];
		})
	);
</script>

<div
	class={styles.sheet}
	style={`${sheetColumnsVar}: ${layout.columns}; ${sheetColumnWidthVar}: ${layout.size.width}mm; ${sheetColumnGapVar}: ${layout.gap}mm; ${sheetRowsVar}: ${layout.rows}; ${sheetRowHeightVar}: ${layout.size.height}mm; ${sheetRowGapVar}: ${layout.gap}mm`}
>
	{@render children()}

	<svg
		class={styles.marks}
		aria-hidden="true"
		width={`${sheetWidth}mm`}
		height={`${sheetHeight}mm`}
		viewBox={`0 0 ${sheetWidth} ${sheetHeight}`}
	>
		{#each verticalMarks as mark, index (index)}
			<rect
				x={mark.x - cutMarkWidth / 2}
				y={layout.y - cutMarkGap - cutMarkLength}
				width={cutMarkWidth}
				height={cutMarkLength}
			/>
			<rect
				x={mark.x - cutMarkWidth / 2}
				y={mark.bottom + cutMarkGap}
				width={cutMarkWidth}
				height={cutMarkLength}
			/>
		{/each}
		{#each horizontalMarks as mark, index (index)}
			<rect
				x={layout.x - cutMarkGap - cutMarkLength}
				y={mark.y - cutMarkWidth / 2}
				width={cutMarkLength}
				height={cutMarkWidth}
			/>
			<rect
				x={mark.right + cutMarkGap}
				y={mark.y - cutMarkWidth / 2}
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
