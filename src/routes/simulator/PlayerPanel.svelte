<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		headerActions: {
			marginLeft: 'auto'
		},
		resources: {
			...css.grid('xs'),
			justifyContent: 'space-between',
			minWidth: 0
		},
		resourceIcon: {
			height: '1.3em',
			width: 'auto',
			color: css.palette.dawn,
			flexShrink: 0
		},
		empty: {
			margin: 0,
			fontSize: '0.85em',
			fontStyle: 'italic',
			color: css.text.subtleColor
		},
		body: {
			...css.column('md')
		},
		selected: {
			outline: `2px solid ${css.palette.cedar}88`,
			outlineOffset: '-2px'
		}
	});
</script>

<script lang="ts">
	import IconButton from '#lib/components/IconButton.svelte';
	import InlineSvg from '#lib/components/InlineSvg.svelte';
	import Panel from '#lib/components/Panel.svelte';
	import type { Card } from '#lib/models/cards';
	import { getResource } from '#lib/models/resources';
	import Counter from './Counter.svelte';
	import CardList from './CardList.svelte';
	import { cardDropHandlers } from './cardDrop';
	import { officeDropHandlers } from './officeDrop';
	import PlayerChip from './PlayerChip.svelte';
	import { useSelection } from './selection.svelte';
	import type { SimulatorState } from './simulatorstate.svelte';
	import { playerResourceTypes, type PlayerState, type Zone } from './types';

	interface Props {
		simulator: SimulatorState;
		player: PlayerState;
	}

	const { simulator, player }: Props = $props();

	const selection = useSelection();
	const selected = $derived(selection.players.has(player.id));

	function onclick(event: MouseEvent) {
		event.stopPropagation();
		if (
			event.target instanceof Element &&
			event.target.closest('button, a, input, select, textarea')
		) {
			return;
		}
		selection.select('player', player.id, event.ctrlKey || event.metaKey);
	}

	let officeOver = $state(false);
	let handOver = $state(false);
	const isOver = $derived(officeOver || handOver);

	const handZone = $derived<Zone>({ kind: 'hand', playerId: player.id });
	const officeZone = $derived<Zone>({ kind: 'player-offices', playerId: player.id });
	const cards = $derived([...player.offices, ...player.hand]);

	function zoneOf(card: Card): Zone {
		return card.type === 'office' ? officeZone : handZone;
	}

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

<Panel
	title={player.name}
	{isOver}
	{ondragover}
	{ondragleave}
	{ondrop}
	class={selected ? styles.selected : undefined}
	data-simulator-player={player.id}
	aria-current={selected ? 'true' : undefined}
	{onclick}
	compact
>
	{#snippet titleContent()}
		<PlayerChip {simulator} {player} />
	{/snippet}

	{#snippet header()}
		<div class={styles.headerActions}>
			<IconButton
				src="ui/delete.svg"
				label={`Elimina ${player.name}`}
				onclick={() => simulator.removePlayer(player.id)}
			/>
		</div>
	{/snippet}

	<div class={styles.body}>
		<div class={styles.resources}>
			{#each playerResourceTypes as resource (resource)}
				<Counter
					compact
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

		<CardList {simulator} {cards} zone={zoneOf} />
		{#if cards.length === 0}
			<p class={styles.empty}>Sense cartes</p>
		{/if}
	</div></Panel
>
