<script lang="ts" module>
	import * as css from '#lib/styles';
	import { sheetGutter, sheetHeight, sheetWidth } from '#lib/cardbacks';

	/** Width of the cut marks, in millimetres. */
	const cutMarkWidth = 0.3;

	/** Length of the cut marks: half of the gutter, so they sit at the edge of the gutter. */
	const cutMarkLength = sheetGutter / 2;

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
	import { getCardBackSheet, getCardBackUrl, type CardBackType } from '#lib/cardbacks';

	interface Props extends StandardAttributeProps {
		type: CardBackType;
	}

	const { type, ...attributes }: Props = $props();

	const sheet = $derived(getCardBackSheet(type));
	const artwork = $derived(getCardBackUrl(type));

	/** Position of the block of cards on the sheet, in millimetres. */
	const blockX = $derived((sheetWidth - sheet.width) / 2);
	const blockY = $derived((sheetHeight - sheet.height) / 2);

	const cardColumns = $derived(
		Array.from({ length: sheet.columns }, (_, index) => blockX + index * sheet.size.width)
	);
	const cardRows = $derived(
		Array.from({ length: sheet.rows }, (_, index) => blockY + index * sheet.size.height)
	);
	const verticalCuts = $derived([...cardColumns, blockX + sheet.width]);
	const horizontalCuts = $derived([...cardRows, blockY + sheet.height]);
</script>

<svg
	{...standardAttributes(attributes, styles.sheet)}
	width={`${sheetWidth}mm`}
	height={`${sheetHeight}mm`}
	viewBox={`0 0 ${sheetWidth} ${sheetHeight}`}
	preserveAspectRatio="none"
>
	{#each cardRows as row (row)}
		{#each cardColumns as column (column)}
			<image
				href={artwork}
				x={column}
				y={row}
				width={sheet.size.width + overlap}
				height={sheet.size.height + overlap}
				preserveAspectRatio="none"
			/>
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
		<image
			href={artwork}
			x={blockX - sheetGutter}
			y={blockY}
			width={sheet.size.width}
			height={sheet.size.height}
			preserveAspectRatio="none"
		/>
		{#each cardColumns as column (column)}
			<image
				href={artwork}
				x={column}
				y={blockY}
				width={sheet.size.width}
				height={sheet.size.height}
				preserveAspectRatio="none"
			/>
		{/each}
		<image
			href={artwork}
			x={blockX + sheet.width + sheetGutter - sheet.size.width}
			y={blockY}
			width={sheet.size.width}
			height={sheet.size.height}
			preserveAspectRatio="none"
		/>
	</svg>

	<svg
		x={blockX - sheetGutter}
		y={blockY + sheet.height - overlap}
		width={sheet.width + 2 * sheetGutter}
		height={sheetGutter + overlap}
		viewBox={`${blockX - sheetGutter} ${blockY + sheet.height - bleedBand} ${sheet.width + 2 * sheetGutter} ${bleedBand}`}
		preserveAspectRatio="none"
	>
		<image
			href={artwork}
			x={blockX - sheetGutter}
			y={blockY + sheet.height - sheet.size.height}
			width={sheet.size.width}
			height={sheet.size.height}
			preserveAspectRatio="none"
		/>
		{#each cardColumns as column (column)}
			<image
				href={artwork}
				x={column}
				y={blockY + sheet.height - sheet.size.height}
				width={sheet.size.width}
				height={sheet.size.height}
				preserveAspectRatio="none"
			/>
		{/each}
		<image
			href={artwork}
			x={blockX + sheet.width + sheetGutter - sheet.size.width}
			y={blockY + sheet.height - sheet.size.height}
			width={sheet.size.width}
			height={sheet.size.height}
			preserveAspectRatio="none"
		/>
	</svg>

	<svg
		x={blockX - sheetGutter}
		y={blockY - sheetGutter}
		width={sheetGutter + overlap}
		height={sheet.height + 2 * sheetGutter}
		viewBox={`${blockX} ${blockY - sheetGutter} ${bleedBand} ${sheet.height + 2 * sheetGutter}`}
		preserveAspectRatio="none"
	>
		<image
			href={artwork}
			x={blockX}
			y={blockY - sheetGutter}
			width={sheet.size.width}
			height={sheet.size.height}
			preserveAspectRatio="none"
		/>
		{#each cardRows as row (row)}
			<image
				href={artwork}
				x={blockX}
				y={row}
				width={sheet.size.width}
				height={sheet.size.height}
				preserveAspectRatio="none"
			/>
		{/each}
		<image
			href={artwork}
			x={blockX}
			y={blockY + sheet.height + sheetGutter - sheet.size.height}
			width={sheet.size.width}
			height={sheet.size.height}
			preserveAspectRatio="none"
		/>
	</svg>

	<svg
		x={blockX + sheet.width - overlap}
		y={blockY - sheetGutter}
		width={sheetGutter + overlap}
		height={sheet.height + 2 * sheetGutter}
		viewBox={`${blockX + sheet.width - bleedBand} ${blockY - sheetGutter} ${bleedBand} ${sheet.height + 2 * sheetGutter}`}
		preserveAspectRatio="none"
	>
		<image
			href={artwork}
			x={blockX + sheet.width - sheet.size.width}
			y={blockY - sheetGutter}
			width={sheet.size.width}
			height={sheet.size.height}
			preserveAspectRatio="none"
		/>
		{#each cardRows as row (row)}
			<image
				href={artwork}
				x={blockX + sheet.width - sheet.size.width}
				y={row}
				width={sheet.size.width}
				height={sheet.size.height}
				preserveAspectRatio="none"
			/>
		{/each}
		<image
			href={artwork}
			x={blockX + sheet.width - sheet.size.width}
			y={blockY + sheet.height + sheetGutter - sheet.size.height}
			width={sheet.size.width}
			height={sheet.size.height}
			preserveAspectRatio="none"
		/>
	</svg>

	{#each verticalCuts as cut (cut)}
		<rect
			x={cut - cutMarkWidth / 2}
			y={blockY - sheetGutter}
			width={cutMarkWidth}
			height={cutMarkLength}
			fill={css.palette.white}
		/>
		<rect
			x={cut - cutMarkWidth / 2}
			y={blockY + sheet.height + sheetGutter - cutMarkLength}
			width={cutMarkWidth}
			height={cutMarkLength}
			fill={css.palette.white}
		/>
	{/each}
	{#each horizontalCuts as cut (cut)}
		<rect
			x={blockX - sheetGutter}
			y={cut - cutMarkWidth / 2}
			width={cutMarkLength}
			height={cutMarkWidth}
			fill={css.palette.white}
		/>
		<rect
			x={blockX + sheet.width + sheetGutter - cutMarkLength}
			y={cut - cutMarkWidth / 2}
			width={cutMarkLength}
			height={cutMarkWidth}
			fill={css.palette.white}
		/>
	{/each}
</svg>
