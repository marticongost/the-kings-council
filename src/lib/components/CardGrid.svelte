<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		cardGrid: css.cards.listing
	});
</script>

<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from '#lib/components/utils';
	import type { Card } from '#lib/models/cards';
	import CardFront from './CardFront.svelte';

	interface Props extends StandardAttributeProps {
		cards: Array<Card>;
	}

	const { cards, style, ...attributes }: Props = $props();

	/** Cards of different types can have different widths, so the whole listing uses the widest. */
	const columnWidth = $derived(
		cards.reduce(
			(widest, card) => Math.max(widest, css.cards.getCardSize(card.type).width),
			css.cards.standard.width
		)
	);
	const columnEmWidth = $derived(
		cards.reduce(
			(widest, card) => Math.max(widest, css.cards.getCardSize(card.type).widthEm),
			css.cards.standard.widthEm
		)
	);
	const listingStyle = $derived(
		`${css.cards.listingColumnWidth}: ${columnWidth}mm; ${css.cards.listingEmWidth}: ${columnEmWidth}${style ? `; ${style}` : ''}`
	);
</script>

<div {...standardAttributes({ ...attributes, style: listingStyle }, styles.cardGrid)}>
	{#each cards as card (card.id)}
		<CardFront {card} />
	{/each}
</div>
