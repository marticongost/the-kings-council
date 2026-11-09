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
		},
		disabledButton: {
			opacity: 0.35
		},
		slideshow: {
			position: 'relative',
			display: 'flex',
			justifyContent: 'center',
			minHeight: css.cards.mini.dimensions().height
		},
		/** Holds the card and the chip of the player who planned the capability. */
		slide: {
			position: 'relative',
			display: 'inline-flex'
		},
		owner: {
			display: 'flex',
			alignItems: 'center',
			position: 'absolute',
			right: 0,
			bottom: 0,
			padding: `0 ${css.spacing.xs}`,
			borderTopLeftRadius: '0.4em',
			backgroundColor: css.palette.wood,
			color: css.palette.white
		},
		counter: {
			position: 'absolute',
			right: 0,
			bottom: 0,
			fontFamily: css.fonts.number,
			fontSize: '0.85em',
			fontWeight: 900,
			color: css.palette.wood
		}
	});
</script>

<script lang="ts">
	import { cx } from '@emotion/css';
	import CardCapabilityFront from '#lib/components/CardCapabilityFront.svelte';
	import {
		provideCapabilityInputValues,
		type CapabilityInputValues
	} from '#lib/components/capabilityinputs';
	import IconButton from '#lib/components/IconButton.svelte';
	import AssetsBidStep from './AssetsBidStep.svelte';
	import CrisisStep from './CrisisStep.svelte';
	import PanelSection from './PanelSection.svelte';
	import { usePlans } from './plans.svelte';
	import PlayerChip from './PlayerChip.svelte';
	import {
		useTurnResolution,
		type AssetsBidResolutionStep,
		type CapabilityResolutionStep,
		type CrisisResolutionStep
	} from './resolution.svelte';
	import { useSelection } from './selection.svelte';
	import type { SimulatorState } from './simulatorstate.svelte';
	import { turnOrderDragMime, type PlayerDragPayload } from './types';

	interface Props {
		simulator: SimulatorState;
	}

	const { simulator }: Props = $props();

	const plans = usePlans();
	const resolution = useTurnResolution();
	const selection = useSelection();

	const players = $derived(
		simulator.turnOrder.flatMap((id) => {
			const player = simulator.players.find((candidate) => candidate.id === id);
			return player ? [player] : [];
		})
	);

	const entry = $derived(resolution.current);
	const total = $derived(resolution.steps.length);
	const capabilityEntry = $derived<CapabilityResolutionStep | null>(
		entry?.kind === 'capability' ? entry : null
	);
	const crisisEntry = $derived<CrisisResolutionStep | null>(
		entry?.kind === 'crisis' ? entry : null
	);
	const assetsBidEntry = $derived<AssetsBidResolutionStep | null>(
		entry?.kind === 'assets-bid' ? entry : null
	);

	// The capability being presented shows the values it was filled in with while planning.
	const capabilityValues: CapabilityInputValues = {
		value: (key) => (capabilityEntry ? simulator.planInput(capabilityEntry.player.id, key) : ''),
		get players() {
			return simulator.players.map((player) => ({ value: player.id, label: player.name }));
		},
		get kingdoms() {
			return simulator.kingdoms.map((kingdom) => ({ value: kingdom.id, label: kingdom.name }));
		}
	};

	provideCapabilityInputValues(capabilityValues);

	// Resetting the plans while resolving leaves nothing to present, so the list comes back.
	$effect(() => {
		if (resolution.active && total === 0) resolution.stop();
	});

	let isOver = $state(false);
	/** Player being dragged within the list, so entries can reorder around it. */
	let draggingId = $state<string | null>(null);
	let dragging = false;
	/** Whether the drag is being recorded, so the whole reorder is a single undoable step. */
	let recordingDrag = false;

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

		// Entries reorder as the player passes over them, so the whole drag is one step.
		simulator.beginTransaction('Reordena el torn');
		recordingDrag = true;

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

		if (recordingDrag) {
			recordingDrag = false;
			simulator.endTransaction();
		}
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
	title="Planificació del torn"
	ariaLabel="Planificació del torn"
	role={resolution.active ? 'group' : 'list'}
	{isOver}
	contentClass={styles.entries}
	{ondragover}
	{ondragleave}
	{ondrop}
>
	{#snippet actions()}
		{#if resolution.active}
			<IconButton
				src="ui/previous.svg"
				class={cx(resolution.atStart && styles.disabledButton)}
				disabled={resolution.atStart}
				label="Pas anterior"
				onclick={() => resolution.previous()}
			/>
			<IconButton
				src={resolution.atEnd ? 'ui/confirm.svg' : 'ui/next.svg'}
				label={resolution.atEnd ? 'Finalitza el torn' : 'Pas següent'}
				onclick={() => resolution.next()}
			/>
			<IconButton
				src="ui/stop.svg"
				label="Atura la resolució del torn"
				onclick={() => resolution.stop()}
			/>
		{:else}
			<IconButton
				src="ui/play.svg"
				class={cx(total === 0 && styles.disabledButton)}
				disabled={total === 0}
				label="Inicia la resolució del torn"
				onclick={() => resolution.start()}
			/>
		{/if}
		<IconButton
			src="ui/reset.svg"
			label="Reinicia la planificació del torn"
			onclick={() => simulator.resetTurnOrder()}
		/>
	{/snippet}

	{#if resolution.active}
		{#if crisisEntry}
			<CrisisStep {simulator} kingdomId={crisisEntry.kingdomId} />
		{:else if assetsBidEntry}
			{#key assetsBidEntry.acquisitionIndex}
				<AssetsBidStep {simulator} acquisitionIndex={assetsBidEntry.acquisitionIndex} />
			{/key}
		{:else}
			<div class={styles.slideshow} aria-live="polite">
				{#if capabilityEntry}
					<div class={styles.slide}>
						<CardCapabilityFront
							cardCapability={capabilityEntry.capability.cardCapability}
							inputKey={capabilityEntry.capability.key}
						/>
						<div class={styles.owner}>
							<PlayerChip {simulator} player={capabilityEntry.player} draggable={false} />
						</div>
					</div>
				{:else}
					<p class={styles.empty}>Cap capacitat planificada</p>
				{/if}
				{#if total > 0}
					<span class={styles.counter}>{resolution.position + 1} / {total}</span>
				{/if}
			</div>
		{/if}
	{:else}
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
				<PlayerChip {simulator} {player} draggable={false} large />
			</div>
		{:else}
			<p class={styles.empty}>Cap jugador</p>
		{/each}
	{/if}
</PanelSection>
