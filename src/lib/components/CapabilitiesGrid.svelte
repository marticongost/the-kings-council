<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		cardGrid: css.cards.listing
	});
</script>

<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from '#lib/components/utils';
	import type { CardCapability } from '#lib/models/cardcapabilities';
	import CardCapabilityFront from './CardCapabilityFront.svelte';

	interface Props extends StandardAttributeProps {
		cardCapabilities: Array<CardCapability>;
	}

	const { cardCapabilities, style, ...attributes }: Props = $props();

	/** Capability cards are always mini cards, so every column has the same width. */
	const columnWidth = css.cards.mini.width;
	const listingStyle = $derived(
		`${css.cards.listingColumnWidth}: ${columnWidth}mm${style ? `; ${style}` : ''}`
	);
</script>

<div {...standardAttributes({ ...attributes, style: listingStyle }, styles.cardGrid)}>
	{#each cardCapabilities as cardCapability (cardCapability.id)}
		<CardCapabilityFront {cardCapability} />
	{/each}
</div>
