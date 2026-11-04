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
			height: '1em',
			width: 'auto',
			flexShrink: 0,
			color: css.palette.thatch
		},
		confirm: {
			height: '0.5em',
			width: 'auto',
			flexShrink: 0,
			color: css.palette.grass
		},
		name: {
			fontSize: '0.8em',
			minWidth: 0,
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			whiteSpace: 'nowrap'
		},
		nameLarge: {
			fontSize: '1em',
			minWidth: 0,
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			whiteSpace: 'nowrap'
		}
	});
</script>

<script lang="ts">
	import { cx } from '@emotion/css';
	import { getCardIcon } from '#lib/cardattributes';
	import InlineSvg from '#lib/components/InlineSvg.svelte';
	import type { SimulatorState } from './simulatorstate.svelte';
	import { playerDragMime, type PlayerDragPayload, type PlayerState } from './types';

	interface Props {
		simulator: SimulatorState;
		player: PlayerState;
		dragHint?: string;
		/** Whether the chip can be dragged itself, e.g. when the whole row is draggable. */
		draggable?: boolean;
		/** Whether the chip is rendered at full size, e.g. in the turn order list. */
		large?: boolean;
		/** Extra classes applied to the chip, e.g. to highlight it. */
		class?: string;
	}

	const {
		simulator,
		player,
		dragHint = 'Arrossega el jugador a un altre regne',
		draggable = true,
		large = false,
		class: className = undefined
	}: Props = $props();

	// The house card identifies the player, falling back to the generic icon when it is gone.
	const icon = $derived.by(() => {
		const house = simulator.houseCardOf(player);
		return house ? getCardIcon(house) : 'keywords/player.svg';
	});

	function onDragStart(event: DragEvent) {
		if (!event.dataTransfer) return;
		const payload: PlayerDragPayload = { playerId: player.id };
		event.dataTransfer.setData(playerDragMime, JSON.stringify(payload));
		event.dataTransfer.effectAllowed = 'move';
	}
</script>

<span
	class={cx(styles.chip, className)}
	role="group"
	{draggable}
	ondragstart={onDragStart}
	title={draggable ? dragHint : undefined}
>
	<InlineSvg class={styles.icon} src={icon} aria-hidden="true" />
	<span class={large ? styles.nameLarge : styles.name}>{player.name}</span>
	{#if player.plan.confirmed}
		<InlineSvg class={styles.confirm} src="ui/confirm.svg" role="img" aria-label="Pla confirmat" />
	{/if}
</span>
