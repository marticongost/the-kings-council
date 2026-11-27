<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		cardGrid: css.cards.listing
	});
</script>

<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from '#lib/components/utils';
	import type { Card } from '#lib/models/cards';
	import { getCardSize, CardSize } from '#lib/styles/cards';
	import { getCardSheetLayout, splitIntoSheets } from '#lib/cardsheets';
	import CardFront from './CardFront.svelte';
	import CardSheet from './CardSheet.svelte';

	interface Props extends StandardAttributeProps {
		cards: Array<Card>;
	}

	const { cards, style, ...attributes }: Props = $props();

	/** Cards of different types can have different widths, so the whole listing uses the widest. */
	const columnWidth = $derived(
		cards.reduce(
			(widest, card) => Math.max(widest, getCardSize(card.type).width),
			css.cards.standard.width
		)
	);
	const columnEmWidth = $derived(
		cards.reduce(
			(widest, card) => Math.max(widest, getCardSize(card.type).widthEm),
			css.cards.standard.widthEm
		)
	);
	const rowHeight = $derived(
		cards.reduce(
			(tallest, card) => Math.max(tallest, getCardSize(card.type).height),
			css.cards.standard.height
		)
	);
	const listingStyle = $derived(
		`${css.cards.listingColumnWidth}: ${columnWidth}mm; ${css.cards.listingEmWidth}: ${columnEmWidth}${style ? `; ${style}` : ''}`
	);

	const sheetLayout = $derived(getCardSheetLayout(new CardSize(columnWidth, rowHeight)));
	const sheets = $derived(splitIntoSheets(cards, sheetLayout.count));
</script>

<div {...standardAttributes({ ...attributes, style: listingStyle }, styles.cardGrid)}>
	{#each sheets as sheetCards, index (index)}
		<CardSheet layout={sheetLayout} cardCount={sheetCards.length}>
			{#each sheetCards as card (card.id)}
				<CardFront {card} />
			{/each}
		</CardSheet>
	{/each}
</div>
