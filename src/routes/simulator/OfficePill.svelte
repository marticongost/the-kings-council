<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		pill: {
			...css.row('xs'),
			padding: `${css.spacing.xs} ${css.spacing.sm}`,
			border: `1px solid ${css.palette.gurkha}`,
			borderRadius: '999em',
			backgroundColor: css.palette.wheat,
			color: css.palette.cedar,
			fontSize: '0.85em',
			cursor: 'grab',
			userSelect: 'none'
		},
		icon: {
			height: '1.1em',
			width: 'auto',
			color: css.palette.wood,
			flexShrink: 0
		}
	});
</script>

<script lang="ts">
	import InlineSvg from '#lib/components/InlineSvg.svelte';
	import { getCardIcon } from '#lib/cardattributes';
	import type { Card } from '#lib/models/cards';
	import { officeDragMime, simulatorDragMime, type DragPayload, type Zone } from './types';

	interface Props {
		card: Card;
		source: Zone;
		uid: string;
	}

	const { card, source, uid }: Props = $props();

	function onDragStart(event: DragEvent) {
		if (!event.dataTransfer) {
			event.preventDefault();
			return;
		}
		const payload: DragPayload = { source, uid };
		const data = JSON.stringify(payload);
		event.dataTransfer.setData(simulatorDragMime, data);
		event.dataTransfer.setData(officeDragMime, data);
		event.dataTransfer.effectAllowed = 'move';
	}
</script>

<span
	class={styles.pill}
	draggable="true"
	ondragstart={onDragStart}
	title={card.title}
	role="listitem"
>
	<InlineSvg class={styles.icon} src={getCardIcon(card)} aria-hidden="true" />
	<span>{card.title}</span>
</span>
