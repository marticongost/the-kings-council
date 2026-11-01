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
			position: 'relative',
			flex: '0 0 auto',
			cursor: 'grab',
			userSelect: 'none'
		},
		/** Makes the card being dragged invisible while its drag image follows the pointer. */
		dragging: {
			opacity: 0
		},
		remove: {
			position: 'absolute',
			right: '0.15em',
			bottom: '0.15em'
		},
		placeholder: {
			...css.cards.mini.dimensions(),
			...css.focus.mixin,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			padding: 0,
			border: `2px dashed ${css.palette.moonMist}`,
			borderRadius: '0.3em',
			backgroundColor: css.palette.carrara,
			color: css.palette.sandal,
			fontSize: '2em',
			cursor: 'pointer',
			'&:hover': {
				borderColor: css.palette.sandal,
				backgroundColor: css.palette.wheat
			}
		},
		popupAnchor: {
			flex: '0 0 auto'
		},
		popup: {
			position: 'fixed',
			zIndex: 300,
			maxHeight: '60vh',
			overflowY: 'auto',
			padding: css.spacing.sm,
			border: css.forms.controlBorder,
			borderRadius: '0.3em',
			backgroundColor: css.palette.linen,
			boxShadow: '0 0.2em 0.5em rgba(0, 0, 0, 0.25)'
		},
		options: {
			display: 'grid',
			gridTemplateColumns: 'repeat(3, max-content)',
			gap: css.spacing.sm,
			alignContent: 'flex-start',
			alignItems: 'flex-start'
		},
		option: {
			...css.focus.mixin,
			display: 'block',
			flex: '0 0 auto',
			padding: 0,
			border: 'none',
			backgroundColor: 'transparent',
			textAlign: 'left',
			cursor: 'pointer'
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
	import { tick } from 'svelte';
	import CardCapabilityFront from '#lib/components/CardCapabilityFront.svelte';
	import IconButton from '#lib/components/IconButton.svelte';
	import InlineSvg from '#lib/components/InlineSvg.svelte';
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
		/** Every capability the player can plan in this list, in display order. */
		capabilities: Array<PlannableCapability>;
		/** The capabilities placed in the plan, in their planned order. */
		planned: Array<PlannableCapability>;
		/** Accessible name of the button that adds a capability, also used as the popup title. */
		addLabel: string;
		/** Accessible name of the button that empties the list. */
		resetLabel: string;
	}

	const { simulator, playerId, listId, title, capabilities, planned, addLabel, resetLabel }: Props =
		$props();

	const unplaced = $derived(
		capabilities.filter((capability) => !planned.some((entry) => entry.key === capability.key))
	);

	let open = $state(false);
	let addButton = $state<HTMLButtonElement>();
	let popup = $state<HTMLDivElement>();
	let isOver = $state(false);
	/** Capability dragged within this planner, used to reorder as it passes over the others. */
	let draggingKey = $state<string | null>(null);
	let dragging = false;
	/** Whether the cards can be dragged, disabled while interacting with their inputs. */
	let cardDraggable = $state(true);

	function togglePopup() {
		if (open) closePopup();
		else open = true;
	}

	function closePopup() {
		if (!open) return;
		open = false;
		void tick().then(() => addButton?.focus());
	}

	function add(capability: PlannableCapability) {
		simulator.addToPlan(playerId, capability.key);
		closePopup();
	}

	/** Positions the popup beside the add button, flipping or clamping within the viewport. */
	function repositionPopup() {
		if (!addButton || !popup) return;

		const margin = 8;
		const anchor = addButton.getBoundingClientRect();
		const bounds = popup.getBoundingClientRect();

		let left = anchor.right + margin;
		if (left + bounds.width > window.innerWidth - margin) {
			left = anchor.left - margin - bounds.width;
		}
		left = Math.max(margin, left);

		let top = anchor.top;
		if (top + bounds.height > window.innerHeight - margin) {
			top = window.innerHeight - margin - bounds.height;
		}
		top = Math.max(margin, top);

		popup.style.left = `${left}px`;
		popup.style.top = `${top}px`;
	}

	$effect(() => {
		if (!open) return;

		// The popup is fixed to the viewport, so it stays above the modal and follows the
		// add button while either the modal or the page scrolls.
		repositionPopup();
		popup?.focus();

		window.addEventListener('scroll', repositionPopup, true);
		window.addEventListener('resize', repositionPopup);
		return () => {
			window.removeEventListener('scroll', repositionPopup, true);
			window.removeEventListener('resize', repositionPopup);
		};
	});

	// The popup closes when the pointer goes elsewhere, and Escape closes it without
	// closing the plan modal, which listens for Escape on the window.
	$effect(() => {
		if (!open) return;

		const closeOnOutside = (event: PointerEvent) => {
			const target = event.target;
			if (target instanceof Node && addButton && addButton.contains(target)) return;
			if (target instanceof Node && popup && popup.contains(target)) return;
			closePopup();
		};
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') return;
			event.preventDefault();
			event.stopPropagation();
			closePopup();
		};

		document.addEventListener('pointerdown', closeOnOutside);
		document.addEventListener('keydown', closeOnEscape, true);
		return () => {
			document.removeEventListener('pointerdown', closeOnOutside);
			document.removeEventListener('keydown', closeOnEscape, true);
		};
	});

	/** Moves the dragged capability to a position, unless it already is there. */
	function moveDraggedTo(index: number) {
		if (!draggingKey) return;

		const from = planned.findIndex((capability) => capability.key === draggingKey);
		const insertAt = from < index ? index - 1 : index;
		if (from < 0 || insertAt === from) return;

		simulator.moveInPlan(playerId, draggingKey, index);
	}

	function ondragover(event: DragEvent) {
		if (!dragging) return;
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
		isOver = true;
		// Reaching the area after the cards moves the dragged capability to the end.
		moveDraggedTo(planned.length);
	}

	function ondragleave(event: DragEvent) {
		const target = event.currentTarget;
		const related = event.relatedTarget;
		if (target instanceof Node && related instanceof Node && target.contains(related)) return;
		isOver = false;
	}

	function onCardDragStart(event: DragEvent, capability: PlannableCapability) {
		if (!event.dataTransfer) return;
		const payload: PlanDragPayload = { playerId, key: capability.key, list: listId };
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
	}

	/** Drops before or after the hovered card, depending on which half the pointer is over. */
	function onCardDragOver(event: DragEvent, index: number) {
		if (!dragging) return;
		event.preventDefault();
		event.stopPropagation();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
		isOver = true;

		if (!(event.currentTarget instanceof HTMLElement)) return;
		const rect = event.currentTarget.getBoundingClientRect();
		moveDraggedTo(event.clientX > rect.left + rect.width / 2 ? index + 1 : index);
	}

	function isFormControl(target: EventTarget | null): boolean {
		return target instanceof Element && target.closest('input, select, textarea, button') !== null;
	}

	/** Middle-clicking a capability removes it, except when editing one of its inputs. */
	function onCardAuxClick(event: MouseEvent, capability: PlannableCapability) {
		if (event.button !== 1) return;
		if (isFormControl(event.target)) return;
		event.preventDefault();
		simulator.removeFromPlan(playerId, capability.key);
	}

	/**
	 * Cards are only draggable from outside their inputs, so the inputs stay editable
	 * in browsers that block editing inside draggable elements.
	 */
	function dragFromCard(node: HTMLElement) {
		const onMouseDown = (event: MouseEvent) => {
			cardDraggable = !isFormControl(event.target);
		};

		node.addEventListener('mousedown', onMouseDown);
		return {
			destroy() {
				node.removeEventListener('mousedown', onMouseDown);
			}
		};
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
>
	{#snippet actions()}
		<IconButton
			src="ui/restart.svg"
			label={resetLabel}
			onclick={() => simulator.clearPlanList(playerId, listId)}
		/>
	{/snippet}

	{#each planned as capability, index (capability.key)}
		<div
			class={cx(styles.card, draggingKey === capability.key && styles.dragging)}
			role="listitem"
			draggable={cardDraggable}
			use:dragFromCard
			ondragstart={(event) => onCardDragStart(event, capability)}
			ondragend={onCardDragEnd}
			ondragover={(event) => onCardDragOver(event, index)}
			onauxclick={(event) => onCardAuxClick(event, capability)}
		>
			<CardCapabilityFront
				cardCapability={capability.cardCapability}
				editable
				inputKey={capability.key}
			/>
			<IconButton
				class={styles.remove}
				src="ui/delete.svg"
				label={`Treu ${capability.cardCapability.card.title}`}
				onclick={() => simulator.removeFromPlan(playerId, capability.key)}
			/>
		</div>
	{/each}

	<div role="listitem" class={styles.popupAnchor}>
		<button
			class={styles.placeholder}
			type="button"
			aria-label={addLabel}
			title={addLabel}
			aria-haspopup="true"
			aria-expanded={open}
			bind:this={addButton}
			onclick={togglePopup}
		>
			<InlineSvg src="ui/add.svg" aria-hidden="true" />
		</button>
		{#if open}
			<div class={styles.popup} role="group" aria-label={addLabel} tabindex="-1" bind:this={popup}>
				<div class={styles.options}>
					{#each unplaced as capability (capability.key)}
						<button
							class={styles.option}
							type="button"
							aria-label={capability.cardCapability.card.title}
							onclick={() => add(capability)}
						>
							<CardCapabilityFront cardCapability={capability.cardCapability} />
						</button>
					{:else}
						<p class={styles.empty}>No queda cap capacitat per planificar.</p>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</PanelSection>
