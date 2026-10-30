<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		list: {
			...css.grid('xs'),
			minWidth: 0
		}
	});
</script>

<script lang="ts">
	import type { Card } from '#lib/models/cards';
	import type { SimulatorState } from './simulatorstate.svelte';
	import CardPill from './CardPill.svelte';
	import { compareCards, type CardRef, type Zone } from './types';

	interface Props {
		simulator: SimulatorState;
		cards: Array<CardRef>;
		/** The zone a card is shown from; offices and other cards use different zones. */
		zone: (card: Card) => Zone;
	}

	const { simulator, cards, zone }: Props = $props();

	const orderedCards = $derived(
		[...cards]
			.map((ref) => ({ ref, card: simulator.cardOf(ref) }))
			.filter((entry): entry is { ref: CardRef; card: Card } => entry.card !== undefined)
			.sort((a, b) => compareCards(a.card, b.card))
	);
</script>

<div class={styles.list} role="list">
	{#each orderedCards as { ref, card } (ref.uid)}
		<CardPill {card} source={zone(card)} uid={ref.uid} />
	{/each}
</div>
