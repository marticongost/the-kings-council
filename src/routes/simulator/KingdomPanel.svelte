<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		title: {
			...css.row('xs'),
			minWidth: 0
		},
		titleIcon: {
			height: '0.8em',
			width: 'auto',
			flexShrink: 0,
			color: css.palette.thatch
		},
		titleName: {
			minWidth: 0,
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			whiteSpace: 'nowrap'
		},
		headerActions: {
			marginLeft: 'auto'
		},
		body: {
			...css.column('md'),
			minWidth: 0
		},
		stats: {
			...css.row('lg'),
			justifyContent: 'space-between',
			flexWrap: 'nowrap',
			overflow: 'hidden'
		},
		statIcon: {
			height: '2em',
			width: 'auto',
			backgroundColor: 'transparent',
			color: css.palette.wood,
			padding: 0,
			borderRadius: 0,
			flexShrink: 0
		}
	});
</script>

<script lang="ts">
	import IconButton from '#lib/components/IconButton.svelte';
	import InlineSvg from '#lib/components/InlineSvg.svelte';
	import KingdomStatIcon from '#lib/components/KingdomStatIcon.svelte';
	import Panel from '#lib/components/Panel.svelte';
	import type { Card } from '#lib/models/cards';
	import { getKingdomStat, kingdomStatTypes } from '#lib/models/kingdomstats';
	import Counter from './Counter.svelte';
	import CardList from './CardList.svelte';
	import PlayerGroup from './PlayerGroup.svelte';
	import { cardDropHandlers } from './cardDrop';
	import { officeDropHandlers } from './officeDrop';
	import { playerDropHandlers } from './playerDrop';
	import type { SimulatorState } from './simulatorstate.svelte';
	import { kingdomStatMax, kingdomStatMin, type KingdomState, type Zone } from './types';

	interface Props {
		simulator: SimulatorState;
		kingdom: KingdomState;
	}

	const { simulator, kingdom }: Props = $props();

	const members = $derived(simulator.membersOf(kingdom.id));

	const officeZone = $derived<Zone>({ kind: 'kingdom-offices', kingdomId: kingdom.id });
	const cardsZone = $derived<Zone>({ kind: 'kingdom-cards', kingdomId: kingdom.id });

	function zoneOf(card: Card): Zone {
		return card.type === 'office' ? officeZone : cardsZone;
	}

	let officeOver = $state(false);
	let cardOver = $state(false);
	let playerOver = $state(false);
	const isOver = $derived(officeOver || cardOver || playerOver);

	const officeDrop = officeDropHandlers({
		simulator: () => simulator,
		zone: () => ({ kind: 'kingdom-offices', kingdomId: kingdom.id }),
		onOverChange: (value) => (officeOver = value)
	});

	const cardDrop = cardDropHandlers({
		simulator: () => simulator,
		zone: () => ({ kind: 'kingdom-cards', kingdomId: kingdom.id }),
		onOverChange: (value) => (cardOver = value)
	});

	const playerDrop = playerDropHandlers({
		simulator: () => simulator,
		kingdomId: () => kingdom.id,
		onOverChange: (value) => (playerOver = value)
	});

	function clearOver() {
		officeOver = false;
		cardOver = false;
		playerOver = false;
	}

	function ondragover(event: DragEvent) {
		// Nested drop zones, such as a player panel, claim the drag themselves.
		if (event.defaultPrevented) {
			clearOver();
			return;
		}

		officeDrop.ondragover(event);
		cardDrop.ondragover(event);
		playerDrop.ondragover(event);
	}

	function ondragleave(event: DragEvent) {
		officeDrop.ondragleave(event);
		cardDrop.ondragleave(event);
		playerDrop.ondragleave(event);
	}

	function ondrop(event: DragEvent) {
		officeDrop.ondrop(event);
		cardDrop.ondrop(event);
		playerDrop.ondrop(event);
	}
</script>

<Panel title={kingdom.name} {isOver} {ondragover} {ondragleave} {ondrop}>
	{#snippet titleContent()}
		<div class={styles.title}>
			<InlineSvg class={styles.titleIcon} src="keywords/kingdom.svg" aria-hidden="true" />
			<span class={styles.titleName}>{kingdom.name}</span>
		</div>
	{/snippet}

	{#snippet header()}
		<div class={styles.headerActions}>
			<IconButton
				src="ui/add-player.svg"
				label={`Afegeix jugador a ${kingdom.name}`}
				onclick={() => simulator.addPlayer(kingdom.id)}
			/>
			<IconButton
				src="ui/delete.svg"
				label={`Elimina ${kingdom.name}`}
				onclick={() => simulator.removeKingdom(kingdom.id)}
			/>
		</div>
	{/snippet}

	<div class={styles.body}>
		<div class={styles.stats}>
			{#each kingdomStatTypes as stat (stat)}
				<Counter
					value={kingdom.stats[stat]}
					label={getKingdomStat(stat).title}
					min={kingdomStatMin}
					max={kingdomStatMax}
					onchange={(value) => simulator.setStat(kingdom.id, stat, value)}
				>
					{#snippet icon()}
						<KingdomStatIcon class={styles.statIcon} {stat} />
					{/snippet}
				</Counter>
			{/each}
		</div>

		<CardList {simulator} cards={kingdom.cards} zone={zoneOf} />

		<PlayerGroup {simulator} players={members} />
	</div>
</Panel>
