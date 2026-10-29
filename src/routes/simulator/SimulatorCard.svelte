<script lang="ts" module>
	import * as css from '#lib/styles';

	const defaultScale = 0.36;
	const hoverScale = 0.6;
	const cardWidth = 63;
	const cardHeight = 88;
	const capabilityCardHeight = 41;

	const styles = css.styles({
		wrapper: {
			position: 'relative',
			flex: '0 0 auto',
			cursor: 'grab',
			'&:hover': {
				zIndex: 30
			},
			'&:hover > div': {
				transform: 'scale(var(--card-hover-scale))'
			}
		},
		staticWrapper: {
			cursor: 'default'
		},
		scaler: {
			position: 'absolute',
			left: 0,
			top: 0,
			transform: 'scale(var(--card-scale))',
			transformOrigin: 'top left',
			transition: 'transform 0.15s ease'
		}
	});
</script>

<script lang="ts">
	import type { CardCapability } from '#lib/models/cardcapabilities';
	import type { Card } from '#lib/models/cards';
	import { cx } from '@emotion/css';
	import CardFront from '#lib/components/CardFront.svelte';
	import CardCapabilityFront from '#lib/components/CardCapabilityFront.svelte';
	import { simulatorDragMime, type DragPayload, type Zone } from './types';

	interface Props {
		card?: Card;
		cardCapability?: CardCapability;
		source?: Zone;
		uid?: string;
		scale?: number;
	}

	const { card, cardCapability, source, uid, scale = defaultScale }: Props = $props();

	const height = $derived(card ? cardHeight : capabilityCardHeight);

	function onDragStart(event: DragEvent) {
		if (!source || !event.dataTransfer) {
			event.preventDefault();
			return;
		}
		const payload: DragPayload = { source, uid };
		event.dataTransfer.setData(simulatorDragMime, JSON.stringify(payload));
		event.dataTransfer.effectAllowed = 'move';
	}
</script>

{#if card}
	<div
		class={cx(styles.wrapper, !source && styles.staticWrapper)}
		style:width={`${cardWidth * scale}mm`}
		style:height={`${height * scale}mm`}
		style:--card-scale={scale}
		style:--card-hover-scale={hoverScale}
		draggable={Boolean(source)}
		ondragstart={onDragStart}
		title={card.title}
		role="listitem"
	>
		<div class={styles.scaler}>
			<CardFront {card} />
		</div>
	</div>
{:else if cardCapability}
	<div
		class={cx(styles.wrapper, styles.staticWrapper)}
		style:width={`${cardWidth * scale}mm`}
		style:height={`${height * scale}mm`}
		style:--card-scale={scale}
		style:--card-hover-scale={hoverScale}
		title={cardCapability.card.title}
		role="listitem"
	>
		<div class={styles.scaler}>
			<CardCapabilityFront {cardCapability} />
		</div>
	</div>
{/if}
