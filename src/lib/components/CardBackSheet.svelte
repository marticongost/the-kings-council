<script lang="ts" module>
	import * as css from '#lib/styles';

	/**
	 * Thickness of the band of artwork whose edge is repeated beyond each edge of a card, in
	 * millimetres.
	 */
	const bleedBand = 0.5;

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
	import { sheetHeight, sheetWidth } from '#lib/cardsheets';

	interface Props extends StandardAttributeProps {
		type: CardBackType;
	}

	const { type, ...attributes }: Props = $props();

	const sheet = $derived(getCardBackSheet(type));
	const artwork = $derived(getCardBackArtwork(type));
	const symbolId = $derived(`card-back-sheet-${type}`);
	const cellId = $derived(`card-back-sheet-${type}-cell`);

	const cardWidth = $derived(sheet.size.width);
	const cardHeight = $derived(sheet.size.height);

	/** Each card is bled by half of the gap, so that a cut anywhere in the gap trims it clean. */
	const bleed = $derived(sheet.gap / 2);

	const cardColumns = $derived(
		Array.from({ length: sheet.columns }, (_, index) => sheet.x + index * sheet.pitchX)
	);
	const cardRows = $derived(
		Array.from({ length: sheet.rows }, (_, index) => sheet.y + index * sheet.pitchY)
	);
</script>

{#snippet art(x: number, y: number)}
	<use href={`#${symbolId}`} {x} {y} width={cardWidth} height={cardHeight} />
{/snippet}

{#snippet band(x: number, y: number, width: number, height: number, viewBox: string)}
	<svg {x} {y} {width} {height} {viewBox} preserveAspectRatio="none">
		{@render art(0, 0)}
	</svg>
{/snippet}

<svg
	{...standardAttributes(attributes, styles.sheet)}
	width={`${sheetWidth}mm`}
	height={`${sheetHeight}mm`}
	viewBox={`0 0 ${sheetWidth} ${sheetHeight}`}
	preserveAspectRatio="none"
>
	<defs>
		<symbol id={symbolId} viewBox={`0 0 ${cardWidth} ${cardHeight}`} preserveAspectRatio="none">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- Trusted SVG from internal assets -->
			{@html artwork}
		</symbol>

		<!--
			A card with its bleed: each edge band of the artwork is repeated beyond the card, and
			the corners repeat the corner bands, so that a cut that lands anywhere in the gap still
			leaves the card complete.
		-->
		<g id={cellId}>
			{@render art(0, 0)}
			{@render band(-bleed, -bleed, cardWidth + 2 * bleed, bleed, `0 0 ${cardWidth} ${bleedBand}`)}
			{@render band(
				-bleed,
				cardHeight,
				cardWidth + 2 * bleed,
				bleed,
				`0 ${cardHeight - bleedBand} ${cardWidth} ${bleedBand}`
			)}
			{@render band(-bleed, 0, bleed, cardHeight, `0 0 ${bleedBand} ${cardHeight}`)}
			{@render band(
				cardWidth,
				0,
				bleed,
				cardHeight,
				`${cardWidth - bleedBand} 0 ${bleedBand} ${cardHeight}`
			)}
			{@render band(-bleed, -bleed, bleed, bleed, `0 0 ${bleedBand} ${bleedBand}`)}
			{@render band(
				cardWidth,
				-bleed,
				bleed,
				bleed,
				`${cardWidth - bleedBand} 0 ${bleedBand} ${bleedBand}`
			)}
			{@render band(
				-bleed,
				cardHeight,
				bleed,
				bleed,
				`0 ${cardHeight - bleedBand} ${bleedBand} ${bleedBand}`
			)}
			{@render band(
				cardWidth,
				cardHeight,
				bleed,
				bleed,
				`${cardWidth - bleedBand} ${cardHeight - bleedBand} ${bleedBand} ${bleedBand}`
			)}
		</g>
	</defs>

	{#each cardRows as row (row)}
		{#each cardColumns as column (column)}
			<use href={`#${cellId}`} x={column} y={row} />
		{/each}
	{/each}
</svg>
