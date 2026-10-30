<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		chip: {
			...css.row('xs'),
			minWidth: 0,
			cursor: 'grab',
			userSelect: 'none'
		},
		icon: {
			height: '0.8em',
			width: 'auto',
			flexShrink: 0,
			color: css.palette.thatch
		},
		name: {
			minWidth: 0,
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			whiteSpace: 'nowrap'
		}
	});
</script>

<script lang="ts">
	import InlineSvg from '#lib/components/InlineSvg.svelte';
	import { playerDragMime, type PlayerDragPayload, type PlayerState } from './types';

	interface Props {
		player: PlayerState;
	}

	const { player }: Props = $props();

	function onDragStart(event: DragEvent) {
		if (!event.dataTransfer) return;
		const payload: PlayerDragPayload = { playerId: player.id };
		event.dataTransfer.setData(playerDragMime, JSON.stringify(payload));
		event.dataTransfer.effectAllowed = 'move';
	}
</script>

<span
	class={styles.chip}
	role="group"
	draggable="true"
	ondragstart={onDragStart}
	title="Arrossega el jugador a un altre regne"
>
	<InlineSvg class={styles.icon} src="keywords/player.svg" aria-hidden="true" />
	<span class={styles.name}>{player.name}</span>
</span>
