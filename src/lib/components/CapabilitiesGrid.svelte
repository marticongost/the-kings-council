<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		cardGrid: css.cards.listing
	});
</script>

<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from '#lib/components/utils';
	import type { CardCapability } from '#lib/models/cardcapabilities';
	import { getCardSheetLayout, splitIntoSheets } from '#lib/cardsheets';
	import CardCapabilityFront from './CardCapabilityFront.svelte';
	import CardSheet from './CardSheet.svelte';

	interface Props extends StandardAttributeProps {
		cardCapabilities: Array<CardCapability>;
	}

	const { cardCapabilities, style, ...attributes }: Props = $props();

	/** Capability cards are always mini cards, so every column has the same width. */
	const columnWidth = css.cards.mini.width;
	const listingStyle = $derived(
		`${css.cards.listingColumnWidth}: ${columnWidth}mm; ${css.cards.listingEmWidth}: ${css.cards.mini.widthEm}${style ? `; ${style}` : ''}`
	);

	const sheetLayout = getCardSheetLayout(css.cards.mini);
	const sheets = $derived(splitIntoSheets(cardCapabilities, sheetLayout.count));
</script>

<div {...standardAttributes({ ...attributes, style: listingStyle }, styles.cardGrid)}>
	{#each sheets as sheetCards, index (index)}
		<CardSheet layout={sheetLayout} cardCount={sheetCards.length}>
			{#each sheetCards as cardCapability (cardCapability.id)}
				<CardCapabilityFront {cardCapability} />
			{/each}
		</CardSheet>
	{/each}
</div>
