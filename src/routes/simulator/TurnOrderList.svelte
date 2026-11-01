<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		entries: {
			...css.column('xs'),
			minHeight: '2em'
		},
		entry: {
			...css.row('xs'),
			...css.hpadding('sm'),
			...css.vpadding('xs'),
			borderRadius: '0.3em',
			cursor: 'pointer',
			// Double-clicking opens the plan, so selecting its text would be disruptive.
			userSelect: 'none',
			'&:hover': {
				backgroundColor: css.palette.carrara
			}
		},
		unconfirmed: {
			opacity: 0.45
		},
		/** Makes the row being dragged invisible while its drag image follows the pointer. */
		dragging: {
			opacity: 0
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
	import { cx } from '@emotion/css';
	import IconButton from '#lib/components/IconButton.svelte';
	import PanelSection from './PanelSection.svelte';
	import { usePlans } from './plans.svelte';
	import PlayerChip from './PlayerChip.svelte';
	import { useSelection } from './selection.svelte';
	import type { SimulatorState } from './simulatorstate.svelte';
	import { turnOrderDragMime, type PlayerDragPayload } from './types';

	interface Props {
		simulator: SimulatorState;
	}

	const { simulator }: Props = $props();

	const plans = usePlans();
	const selection = useSelection();

	const players = $derived(
		simulator.turnOrder.flatMap((id) => {
			const player = simulator.players.find((candidate) => candidate.id === id);
			return player ? [player] : [];
		})
	);

	let isOver = $state(false);
	/** Player being dragged within the list, so entries can reorder around it. */
	let draggingId = $state<string | null>(null);
	let dragging = false;

	function hasTurnOrderPayload(event: DragEvent): boolean {
		return event.dataTransfer?.types.includes(turnOrderDragMime) ?? false;
	}

	function ondragover(event: DragEvent) {
		if (!hasTurnOrderPayload(event)) return;
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
		isOver = true;
	}

	function ondragleave(event: DragEvent) {
		const target = event.currentTarget;
		const related = event.relatedTarget;
		if (target instanceof Node && related instanceof Node && target.contains(related)) return;
		isOver = false;
	}

	function ondrop(event: DragEvent) {
		if (!hasTurnOrderPayload(event)) return;
		event.preventDefault();
		isOver = false;
	}

	function ondragstart(event: DragEvent, playerId: string) {
		if (!event.dataTransfer) return;

		const payload: PlayerDragPayload = { playerId };
		event.dataTransfer.setData(turnOrderDragMime, JSON.stringify(payload));
		event.dataTransfer.effectAllowed = 'move';
		dragging = true;

		// The row is hidden once its drag image, which follows the pointer as the ghost, has
		// been captured. Delaying the change keeps the image from being an empty row.
		setTimeout(() => {
			if (dragging) draggingId = playerId;
		}, 0);
	}

	function ondragend() {
		dragging = false;
		draggingId = null;
		isOver = false;
	}

	/** Moves the dragged player to a position, unless they already are there. */
	function moveDraggedTo(index: number) {
		if (!draggingId) return;

		const from = players.findIndex((player) => player.id === draggingId);
		const insertAt = from < index ? index - 1 : index;
		if (from < 0 || insertAt === from) return;

		simulator.moveInTurnOrder(draggingId, index);
	}

	/** Reorders the dragged player as it passes over the entries, before dropping. */
	function onEntryDragOver(event: DragEvent, index: number) {
		if (!hasTurnOrderPayload(event)) return;
		event.preventDefault();
		event.stopPropagation();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
		isOver = true;

		if (!(event.currentTarget instanceof HTMLElement)) return;
		const rect = event.currentTarget.getBoundingClientRect();
		moveDraggedTo(event.clientY > rect.top + rect.height / 2 ? index + 1 : index);
	}

	function onclick(event: MouseEvent, playerId: string) {
		event.stopPropagation();
		selection.select('player', playerId, event.ctrlKey || event.metaKey);
	}

	function ondblclick(event: MouseEvent, playerId: string) {
		event.stopPropagation();
		plans.open(playerId);
	}
</script>

<PanelSection
	title="Ordre de torn"
	ariaLabel="Ordre de torn"
	role="list"
	{isOver}
	contentClass={styles.entries}
	{ondragover}
	{ondragleave}
	{ondrop}
>
	{#snippet actions()}
		<IconButton
			src="ui/reset.svg"
			label="Reinicia la planificació del torn"
			onclick={() => simulator.resetTurnOrder()}
		/>
	{/snippet}

	{#each players as player, index (player.id)}
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
		<div
			class={cx(
				styles.entry,
				draggingId === player.id ? styles.dragging : !player.plan.confirmed && styles.unconfirmed
			)}
			role="listitem"
			draggable="true"
			title="Arrossega el jugador per canviar l'ordre de torn"
			ondragstart={(event) => ondragstart(event, player.id)}
			{ondragend}
			ondragover={(event) => onEntryDragOver(event, index)}
			onclick={(event) => onclick(event, player.id)}
			ondblclick={(event) => ondblclick(event, player.id)}
		>
			<PlayerChip {simulator} {player} draggable={false} />
		</div>
	{:else}
		<p class={styles.empty}>Cap jugador</p>
	{/each}
</PanelSection>
