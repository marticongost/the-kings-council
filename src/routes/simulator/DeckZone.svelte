<script lang="ts" module>
	import * as css from '#lib/styles';
	import { cardsCatalog } from '#lib/data/catalog';
	import type { Card, CardType } from '#lib/models/cards';

	const backScale = 0.4;
	const backWidth = css.cards.standard.width * backScale;
	const backHeight = css.cards.standard.height * backScale;
	const layerOffset = 2;
	const stackWidth = backWidth + layerOffset * 2;
	const stackHeight = backHeight + layerOffset * 2;

	const mm = (value: number) => `${value}mm`;

	const styles = css.styles({
		deck: {
			...css.column('xs'),
			minWidth: 0
		},
		columns: {
			display: 'grid',
			gridTemplateColumns: `repeat(2, ${mm(stackWidth)})`,
			gap: css.spacing.sm,
			alignItems: 'start'
		},
		deckStack: {
			position: 'relative',
			width: mm(stackWidth),
			height: mm(stackHeight),
			cursor: 'grab',
			borderRadius: '1mm',
			alignSelf: 'start'
		},
		deckStackEmpty: {
			cursor: 'default',
			opacity: 0.5
		},
		over: {
			outline: `2px solid ${css.palette.sandal}`,
			outlineOffset: '3px'
		},
		back: {
			position: 'absolute',
			width: mm(backWidth),
			height: mm(backHeight),
			overflow: 'hidden',
			borderRadius: '1mm',
			border: `1px solid ${css.palette.gurkha}`,
			backgroundColor: css.palette.sandal,
			boxShadow: '0.5mm 0.5mm 1mm rgba(0,0,0,0.25)'
		},
		backBottom: {
			left: mm(layerOffset * 2),
			top: mm(layerOffset * 2)
		},
		backMiddle: {
			left: mm(layerOffset),
			top: mm(layerOffset)
		},
		backTop: {
			left: 0,
			top: 0
		},
		scaler: {
			transform: `scale(${backScale})`,
			transformOrigin: 'top left'
		}
	});

	/** Face-down decks still render a back when empty, using any card of the deck type. */
	function representativeCard(type: CardType): Card | undefined {
		return cardsCatalog.all().find((card) => card.type === type);
	}
</script>

<script lang="ts">
	import { cx } from '@emotion/css';
	import CardBack from '#lib/components/CardBack.svelte';
	import { getProperty } from '#lib/models/properties';
	import type { SimulatorState } from './simulatorstate.svelte';
	import { simulatorDragMime, type DragPayload } from './types';
	import CardZone from './CardZone.svelte';
	import CountBadge from './CountBadge.svelte';

	interface Props {
		simulator: SimulatorState;
		cardType: CardType;
	}

	const { simulator, cardType }: Props = $props();

	const title = $derived(getProperty(cardType).title);
	const deck = $derived(simulator.decks[cardType]);
	const count = $derived(deck.length);
	const backCard = $derived.by(() => {
		const top = deck[deck.length - 1];
		return (top ? simulator.cardOf(top) : undefined) ?? representativeCard(cardType);
	});

	let isOver = $state(false);

	function hasSimulatorPayload(event: DragEvent): boolean {
		return event.dataTransfer?.types.includes(simulatorDragMime) ?? false;
	}

	function onDragStart(event: DragEvent) {
		if (count === 0 || !event.dataTransfer) {
			event.preventDefault();
			return;
		}
		const payload: DragPayload = { source: { kind: 'deck', cardType } };
		event.dataTransfer.setData(simulatorDragMime, JSON.stringify(payload));
		event.dataTransfer.effectAllowed = 'move';
	}

	function onDragOver(event: DragEvent) {
		if (!hasSimulatorPayload(event)) return;
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
		isOver = true;
	}

	function onDragLeave(event: DragEvent) {
		const target = event.currentTarget;
		const related = event.relatedTarget;
		if (target instanceof Node && related instanceof Node && target.contains(related)) return;
		isOver = false;
	}

	function onDrop(event: DragEvent) {
		isOver = false;
		const raw = event.dataTransfer?.getData(simulatorDragMime);
		if (!raw) return;
		event.preventDefault();

		try {
			const payload = JSON.parse(raw) as DragPayload;
			simulator.moveCard(payload.source, { kind: 'deck', cardType }, payload.uid);
		} catch {
			// Ignore malformed payloads from outside the simulator.
		}
	}
</script>

<section class={styles.deck} aria-label={title}>
	<div class={styles.columns}>
		<div
			class={cx(styles.deckStack, count === 0 && styles.deckStackEmpty, isOver && styles.over)}
			draggable={count > 0}
			role="group"
			aria-label={`Baralla de ${title}: ${count} cartes`}
			title="Arrossega per robar la carta superior"
			ondragstart={onDragStart}
			ondragover={onDragOver}
			ondragleave={onDragLeave}
			ondrop={onDrop}
		>
			{#if backCard}
				<span class={cx(styles.back, styles.backBottom)} aria-hidden="true">
					<CardBack card={backCard} class={styles.scaler} />
				</span>
				<span class={cx(styles.back, styles.backMiddle)} aria-hidden="true">
					<CardBack card={backCard} class={styles.scaler} />
				</span>
				<span class={cx(styles.back, styles.backTop)} aria-hidden="true">
					<CardBack card={backCard} class={styles.scaler} />
				</span>
			{/if}
			<CountBadge {count} />
		</div>

		<CardZone
			{simulator}
			cards={simulator.discards[cardType]}
			zone={{ kind: 'discard', cardType }}
			ariaLabel="Descarts"
			emptyIcon="discard.svg"
			pile
			height={mm(stackHeight)}
			cardScale={0.3}
		/>
	</div>
</section>
