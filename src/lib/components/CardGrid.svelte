<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		cardGrid: {
			...css.grid('md')
		}
	});
</script>

<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from '#lib/components/utils';
	import type { Card } from '#lib/models/cards';
	import CardFront from './CardFront.svelte';

	interface Props extends StandardAttributeProps {
		cards: Array<Card>;
	}

	const { cards, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, styles.cardGrid)}>
	{#each cards as card (card.id)}
		<CardFront {card} />
	{/each}
</div>
