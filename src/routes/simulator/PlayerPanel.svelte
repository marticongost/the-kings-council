<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		offices: {
			flex: '1 1 auto',
			minWidth: 0
		},
		resources: {
			...css.grid('md'),
			minWidth: 0
		},
		resourceIcon: {
			height: '2em',
			width: 'auto',
			color: css.palette.dawn,
			flexShrink: 0
		},
		hand: {
			...css.grid('xs'),
			minWidth: 0
		},
		empty: {
			margin: 0,
			fontSize: '0.85em',
			fontStyle: 'italic',
			color: css.text.subtleColor
		}
	});
</script>

<script lang="ts">
	import IconButton from '#lib/components/IconButton.svelte';
	import InlineSvg from '#lib/components/InlineSvg.svelte';
	import Panel from '#lib/components/Panel.svelte';
	import { getResource } from '#lib/models/resources';
	import Counter from './Counter.svelte';
	import OfficeList from './OfficeList.svelte';
	import { cardDropHandlers } from './cardDrop';
	import { officeDropHandlers } from './officeDrop';
	import PlayerChip from './PlayerChip.svelte';
	import CardPill from './CardPill.svelte';
	import type { SimulatorState } from './simulatorstate.svelte';
	import { playerResourceTypes, type PlayerState } from './types';

	interface Props {
		simulator: SimulatorState;
		player: PlayerState;
	}

	const { simulator, player }: Props = $props();

	let officeOver = $state(false);
	let handOver = $state(false);
	const isOver = $derived(officeOver || handOver);

	const officeDrop = officeDropHandlers({
		simulator: () => simulator,
		zone: () => ({ kind: 'player-offices', playerId: player.id }),
		onOverChange: (value) => (officeOver = value)
	});

	const handDrop = cardDropHandlers({
		simulator: () => simulator,
		zone: () => ({ kind: 'hand', playerId: player.id }),
		onOverChange: (value) => (handOver = value)
	});

	function ondragover(event: DragEvent) {
		officeDrop.ondragover(event);
		handDrop.ondragover(event);
	}

	function ondragleave(event: DragEvent) {
		officeDrop.ondragleave(event);
		handDrop.ondragleave(event);
	}

	function ondrop(event: DragEvent) {
		officeDrop.ondrop(event);
		handDrop.ondrop(event);
	}
</script>

<Panel title={player.name} {isOver} {ondragover} {ondragleave} {ondrop}>
	{#snippet titleContent()}
		<PlayerChip {simulator} {player} />
	{/snippet}

	{#snippet header()}
		<div class={styles.offices}>
			<OfficeList
				{simulator}
				offices={player.offices}
				zone={{ kind: 'player-offices', playerId: player.id }}
			/>
		</div>
		<IconButton
			src="ui/delete.svg"
			label={`Elimina ${player.name}`}
			onclick={() => simulator.removePlayer(player.id)}
		/>
	{/snippet}

	<div class={styles.resources}>
		{#each playerResourceTypes as resource (resource)}
			<Counter
				value={player.resources[resource]}
				label={getResource(resource).title}
				min={0}
				onchange={(value) => simulator.setResource(player.id, resource, value)}
			>
				{#snippet icon()}
					<InlineSvg class={styles.resourceIcon} src={`resources/${resource}.svg`} />
				{/snippet}
			</Counter>
		{/each}
	</div>

	<div class={styles.hand} role="list">
		{#each player.hand as ref (ref.uid)}
			{@const card = simulator.cardOf(ref)}
			{#if card}
				<CardPill {card} source={{ kind: 'hand', playerId: player.id }} uid={ref.uid} />
			{/if}
		{/each}
		{#if player.hand.length === 0}
			<p class={styles.empty}>Sense cartes</p>
		{/if}
	</div>
</Panel>
