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
			fontSize: '0.9em',
			minWidth: 0,
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			whiteSpace: 'nowrap'
		},
		nameLarge: {
			fontSize: '1.1em',
			minWidth: 0,
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			whiteSpace: 'nowrap'
		},
		status: {
			borderRadius: '0.3em',
			padding: css.spacing.sm
		},
		statusWinner: {
			color: css.palette.green,
			backgroundColor: css.palette.willow
		},
		statusLoser: {
			color: css.palette.buccaneer,
			backgroundColor: css.palette.blush
		}
	});
</script>

<script lang="ts">
	import { cx } from '@emotion/css';
	import type { Snippet } from 'svelte';
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
		/** Whether the plan-confirmed marker is shown, e.g. on bid rows it is hidden. */
		ready?: boolean;
		/** Trailing content rendered after the name, e.g. a bid resource. */
		children?: Snippet;
		/** Optional emphasis, e.g. the outcome of an asset bid. */
		status?: 'winner' | 'loser';
		/** Extra classes applied to the chip, e.g. to highlight it. */
		class?: string;
	}

	const {
		simulator,
		player,
		dragHint = 'Arrossega el jugador a un altre regne',
		draggable = true,
		large = false,
		ready = true,
		children,
		status,
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
	class={cx(
		styles.chip,
		status && styles.status,
		status === 'winner' && styles.statusWinner,
		status === 'loser' && styles.statusLoser,
		className
	)}
	role="group"
	{draggable}
	ondragstart={onDragStart}
	title={draggable ? dragHint : undefined}
>
	<InlineSvg class={styles.icon} src={icon} aria-hidden="true" />
	<span class={large ? styles.nameLarge : styles.name}>{player.name}</span>
	{#if children}
		{@render children()}
	{/if}
	{#if ready && player.plan.confirmed}
		<InlineSvg class={styles.confirm} src="ui/confirm.svg" role="img" aria-label="Pla confirmat" />
	{/if}
</span>
