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
	import { officeTypes } from '#lib/models/offices';
	import type { SimulatorState } from './simulatorstate.svelte';
	import CardPill from './CardPill.svelte';
	import type { CardRef, Zone } from './types';

	// Keep pills in the canonical office order regardless of assignment history.
	const officeOrder = new Map<string, number>(officeTypes.map((type, index) => [type, index]));

	interface Props {
		simulator: SimulatorState;
		offices: Array<CardRef>;
		zone: Zone;
	}

	const { simulator, offices, zone }: Props = $props();

	const orderedOffices = $derived(
		[...offices].sort(
			(a, b) =>
				(officeOrder.get(a.cardId) ?? Number.MAX_SAFE_INTEGER) -
				(officeOrder.get(b.cardId) ?? Number.MAX_SAFE_INTEGER)
		)
	);
</script>

<div class={styles.list} role="list">
	{#each orderedOffices as ref (ref.uid)}
		{@const card = simulator.cardOf(ref)}
		{#if card}
			<CardPill {card} source={zone} uid={ref.uid} />
		{/if}
	{/each}
</div>
