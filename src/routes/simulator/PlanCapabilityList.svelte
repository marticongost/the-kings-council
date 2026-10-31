<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		cards: {
			...css.grid('sm'),
			alignContent: 'flex-start',
			alignItems: 'flex-start',
			minHeight: '4em'
		},
		card: {
			flex: '0 0 auto',
			cursor: 'grab',
			userSelect: 'none'
		},
		/** Makes the card being dragged invisible while its drag image follows the pointer. */
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
	import CardCapabilityFront from '#lib/components/CardCapabilityFront.svelte';
	import PanelSection from './PanelSection.svelte';
	import type { SimulatorState } from './simulatorstate.svelte';
	import {
		planDragMime,
		type PlanDragPayload,
		type PlanListId,
		type PlannableCapability
	} from './types';

	interface Props {
		simulator: SimulatorState;
		playerId: string;
		listId: PlanListId;
		title: string;
		capabilities: Array<PlannableCapability>;
		emptyLabel: string;
	}

	const { simulator, playerId, listId, title, capabilities, emptyLabel }: Props = $props();

	let isOver = $state(false);
	/** Position the dragged capability will be inserted at, based on the hovered card. */
	let dropIndex = $state<number | null>(null);
	/** Capability dragged within this list, so cards can reorder around it while moving. */
	let draggingKey = $state<string | null>(null);
	let dragging = false;

	function hasPlanPayload(event: DragEvent): boolean {
		return event.dataTransfer?.types.includes(planDragMime) ?? false;
	}

	function ondragover(event: DragEvent) {
		if (!hasPlanPayload(event)) return;
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
		isOver = true;
		// Cards handle their own hover; reaching here means the pointer is past them. A drag
		// within the list is not moved to the end, only a drag coming from the other list.
		if (!draggingKey) dropIndex = capabilities.length;
	}

	function ondragleave(event: DragEvent) {
		const target = event.currentTarget;
		const related = event.relatedTarget;
		if (target instanceof Node && related instanceof Node && target.contains(related)) return;
		isOver = false;
		dropIndex = null;
	}

	function ondrop(event: DragEvent) {
		const raw = event.dataTransfer?.getData(planDragMime);
		const index = dropIndex ?? capabilities.length;
		isOver = false;
		dropIndex = null;
		if (!raw) return;

		event.preventDefault();
		try {
			const payload = JSON.parse(raw) as PlanDragPayload;
			if (payload.playerId !== playerId) return;
			// A capability dragged within this list was already reordered as it moved.
			if (payload.from === listId) return;
			simulator.moveCapability(payload.playerId, payload.key, payload.from, listId, index);
		} catch {
			// Ignore malformed payloads from outside the simulator.
		}
	}

	function onCardDragStart(event: DragEvent, capability: PlannableCapability) {
		if (!event.dataTransfer) return;
		const payload: PlanDragPayload = { playerId, key: capability.key, from: listId };
		event.dataTransfer.setData(planDragMime, JSON.stringify(payload));
		event.dataTransfer.effectAllowed = 'move';
		dragging = true;

		// The card is hidden once its drag image, which follows the pointer as the ghost,
		// has been captured. Delaying the change keeps the image from being an empty card.
		setTimeout(() => {
			if (dragging) draggingKey = capability.key;
		}, 0);
	}

	function onCardDragEnd() {
		dragging = false;
		draggingKey = null;
		isOver = false;
		dropIndex = null;
	}

	/** Moves the dragged capability to a position, unless it already is there. */
	function moveDraggedTo(index: number) {
		if (!draggingKey) return;

		const from = capabilities.findIndex((capability) => capability.key === draggingKey);
		const insertAt = from < index ? index - 1 : index;
		if (from < 0 || insertAt === from) return;

		simulator.moveCapability(playerId, draggingKey, listId, listId, index);
	}

	/** Drops before or after the hovered card, depending on which half the pointer is over. */
	function onCardDragOver(event: DragEvent, index: number) {
		if (!hasPlanPayload(event)) return;
		event.preventDefault();
		event.stopPropagation();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
		isOver = true;

		if (!(event.currentTarget instanceof HTMLElement)) return;
		const rect = event.currentTarget.getBoundingClientRect();
		const target = event.clientX > rect.left + rect.width / 2 ? index + 1 : index;

		// Reorder as the dragged card passes over the others, before dropping.
		if (draggingKey) moveDraggedTo(target);
		else dropIndex = target;
	}

	/** Double-clicking a capability appends it to the other list. */
	function onCardDoubleClick(capability: PlannableCapability) {
		const target: PlanListId = listId === 'available' ? 'planned' : 'available';
		simulator.moveCapability(playerId, capability.key, listId, target);
	}
</script>

<PanelSection
	{title}
	ariaLabel={title}
	role="list"
	{isOver}
	contentClass={styles.cards}
	{ondragover}
	{ondragleave}
	{ondrop}
>
	{#each capabilities as capability, index (capability.key)}
		<div
			class={cx(styles.card, draggingKey === capability.key && styles.dragging)}
			role="listitem"
			draggable="true"
			ondblclick={() => onCardDoubleClick(capability)}
			ondragstart={(event) => onCardDragStart(event, capability)}
			ondragend={onCardDragEnd}
			ondragover={(event) => onCardDragOver(event, index)}
		>
			<CardCapabilityFront cardCapability={capability.cardCapability} />
		</div>
	{:else}
		<p class={styles.empty}>{emptyLabel}</p>
	{/each}
</PanelSection>
