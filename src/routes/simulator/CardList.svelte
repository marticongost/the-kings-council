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
	import type { SimulatorState } from './simulatorstate.svelte';
	import CardPill from './CardPill.svelte';
	import type { CardRef, Zone } from './types';

	interface Props {
		simulator: SimulatorState;
		cards: Array<CardRef>;
		/** Kingdom these cards are attached to; offices and other cards use different zones. */
		kingdomId: string;
	}

	const { simulator, cards, kingdomId }: Props = $props();

	const officeZone = $derived<Zone>({ kind: 'kingdom-offices', kingdomId });
	const cardsZone = $derived<Zone>({ kind: 'kingdom-cards', kingdomId });
</script>

<div class={styles.list} role="list">
	{#each cards as ref (ref.uid)}
		{@const card = simulator.cardOf(ref)}
		{#if card}
			<CardPill {card} source={card.type === 'office' ? officeZone : cardsZone} uid={ref.uid} />
		{/if}
	{/each}
</div>
