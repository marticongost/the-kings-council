<script lang="ts" module>
	import * as css from '#lib/styles';
	import { sheetGutter, sheetHeight, sheetWidth } from '#lib/cardsheets';

	/** Thickness of the band of artwork whose edge is repeated into the gutter, in millimetres. */
	const bleedBand = 0.5;

	/**
	 * Cards are drawn slightly larger than their nominal size, and the gutters overlap them by
	 * the same amount, so that antialiased edges never leave a white hairline between them.
	 */
	const overlap = 0.5;

	const styles = css.styles({
		sheet: {
			display: 'block',
			margin: '0 auto',
			backgroundColor: css.palette.white
		}
	});
</script>

<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from '#lib/components/utils';
	import { getCardBackArtwork } from '#lib/cardback-artwork';
	import { getCardBackSheet, type CardBackType } from '#lib/cardbacks';

	interface Props extends StandardAttributeProps {
		type: CardBackType;
	}

	const { type, ...attributes }: Props = $props();

	const sheet = $derived(getCardBackSheet(type));
	const artwork = $derived(getCardBackArtwork(type));
	const symbolId = $derived(`card-back-sheet-${type}`);

	/** Position of the block of cards on the sheet, in millimetres. */
	const blockX = $derived(sheet.x);
	const blockY = $derived(sheet.y);

	const cardColumns = $derived(
		Array.from({ length: sheet.columns }, (_, index) => blockX + index * sheet.size.width)
	);
	const cardRows = $derived(
		Array.from({ length: sheet.rows }, (_, index) => blockY + index * sheet.size.height)
	);
</script>

{#snippet cardBack(x: number, y: number, width: number, height: number)}
	<use href={`#${symbolId}`} {x} {y} {width} {height} />
{/snippet}

<svg
	{...standardAttributes(attributes, styles.sheet)}
	width={`${sheetWidth}mm`}
	height={`${sheetHeight}mm`}
	viewBox={`0 0 ${sheetWidth} ${sheetHeight}`}
	preserveAspectRatio="none"
>
	<defs>
		<symbol
			id={symbolId}
			viewBox={`0 0 ${sheet.size.width} ${sheet.size.height}`}
			preserveAspectRatio="none"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- Trusted SVG from internal assets -->
			{@html artwork}
		</symbol>
	</defs>

	{#each cardRows as row (row)}
		{#each cardColumns as column (column)}
			{@render cardBack(column, row, sheet.size.width + overlap, sheet.size.height + overlap)}
		{/each}
	{/each}

	<!--
		Each gutter repeats the outermost band of the cards on its side, with an extra copy of the
		corner cards so that the corners are filled too.
	-->
	<svg
		x={blockX - sheetGutter}
		y={blockY - sheetGutter}
		width={sheet.width + 2 * sheetGutter}
		height={sheetGutter + overlap}
		viewBox={`${blockX - sheetGutter} ${blockY} ${sheet.width + 2 * sheetGutter} ${bleedBand}`}
		preserveAspectRatio="none"
	>
		{@render cardBack(blockX - sheetGutter, blockY, sheet.size.width, sheet.size.height)}
		{#each cardColumns as column (column)}
			{@render cardBack(column, blockY, sheet.size.width, sheet.size.height)}
		{/each}
		{@render cardBack(
			blockX + sheet.width + sheetGutter - sheet.size.width,
			blockY,
			sheet.size.width,
			sheet.size.height
		)}
	</svg>

	<svg
		x={blockX - sheetGutter}
		y={blockY + sheet.height - overlap}
		width={sheet.width + 2 * sheetGutter}
		height={sheetGutter + overlap}
		viewBox={`${blockX - sheetGutter} ${blockY + sheet.height - bleedBand} ${sheet.width + 2 * sheetGutter} ${bleedBand}`}
		preserveAspectRatio="none"
	>
		{@render cardBack(
			blockX - sheetGutter,
			blockY + sheet.height - sheet.size.height,
			sheet.size.width,
			sheet.size.height
		)}
		{#each cardColumns as column (column)}
			{@render cardBack(
				column,
				blockY + sheet.height - sheet.size.height,
				sheet.size.width,
				sheet.size.height
			)}
		{/each}
		{@render cardBack(
			blockX + sheet.width + sheetGutter - sheet.size.width,
			blockY + sheet.height - sheet.size.height,
			sheet.size.width,
			sheet.size.height
		)}
	</svg>

	<svg
		x={blockX - sheetGutter}
		y={blockY - sheetGutter}
		width={sheetGutter + overlap}
		height={sheet.height + 2 * sheetGutter}
		viewBox={`${blockX} ${blockY - sheetGutter} ${bleedBand} ${sheet.height + 2 * sheetGutter}`}
		preserveAspectRatio="none"
	>
		{@render cardBack(blockX, blockY - sheetGutter, sheet.size.width, sheet.size.height)}
		{#each cardRows as row (row)}
			{@render cardBack(blockX, row, sheet.size.width, sheet.size.height)}
		{/each}
		{@render cardBack(
			blockX,
			blockY + sheet.height + sheetGutter - sheet.size.height,
			sheet.size.width,
			sheet.size.height
		)}
	</svg>

	<svg
		x={blockX + sheet.width - overlap}
		y={blockY - sheetGutter}
		width={sheetGutter + overlap}
		height={sheet.height + 2 * sheetGutter}
		viewBox={`${blockX + sheet.width - bleedBand} ${blockY - sheetGutter} ${bleedBand} ${sheet.height + 2 * sheetGutter}`}
		preserveAspectRatio="none"
	>
		{@render cardBack(
			blockX + sheet.width - sheet.size.width,
			blockY - sheetGutter,
			sheet.size.width,
			sheet.size.height
		)}
		{#each cardRows as row (row)}
			{@render cardBack(
				blockX + sheet.width - sheet.size.width,
				row,
				sheet.size.width,
				sheet.size.height
			)}
		{/each}
		{@render cardBack(
			blockX + sheet.width - sheet.size.width,
			blockY + sheet.height + sheetGutter - sheet.size.height,
			sheet.size.width,
			sheet.size.height
		)}
	</svg>
</svg>
