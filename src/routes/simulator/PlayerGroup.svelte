<script lang="ts" module>
	import * as css from '#lib/styles';
	import { playerColumnWidth } from './playerlayout';

	/** Height a column keeps even when the viewport leaves less room for it. */
	const minimumColumnHeight = 320;

	const styles = css.styles({
		group: {
			display: 'flex',
			flexDirection: 'column',
			flexWrap: 'wrap',
			alignContent: 'flex-start',
			gap: css.spacing.md,
			width: 'max-content',
			minWidth: 0
		},
		player: {
			flex: '0 0 auto',
			display: 'flex',
			flexDirection: 'column',
			width: playerColumnWidth,
			// Let the panel stretch to the shared height given to every column of players.
			'& > *': { flex: '1 1 auto' }
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
	import PlayerPanel from './PlayerPanel.svelte';
	import type { SimulatorState } from './simulatorstate.svelte';
	import type { PlayerState } from './types';

	interface Props {
		simulator: SimulatorState;
		players: Array<PlayerState>;
		emptyLabel?: string;
		/** Called when the players wrap into a different number of columns. */
		onColumnsChange?: (columns: number) => void;
	}

	const { simulator, players, emptyLabel = 'Sense jugadors', onColumnsChange }: Props = $props();

	let group = $state<HTMLDivElement>();
	let columnHeight = $state(minimumColumnHeight);
	let columns = 1;

	function setColumns(value: number) {
		if (value === columns) return;
		columns = value;
		onColumnsChange?.(value);
	}

	// Keep each column as tall as the space left below it, so the group fills the viewport
	// vertically before spawning another column.
	$effect(() => {
		const element = group;
		if (!element) return;

		const update = () => {
			const container = element.closest('main');
			const containerTop = container?.getBoundingClientRect().top ?? 0;
			const containerHeight = container?.clientHeight ?? window.innerHeight;
			const offset =
				element.getBoundingClientRect().top - containerTop + (container?.scrollTop ?? 0);
			const panel = element.closest('article');
			const panelStyles = panel ? getComputedStyle(panel) : undefined;
			// Account for the space the panel adds below the group, so the whole panel
			// fits in the viewport.
			const panelBottom =
				Number.parseFloat(panelStyles?.paddingBottom ?? '0') +
				Number.parseFloat(panelStyles?.borderBottomWidth ?? '0');
			const gap =
				Number.parseFloat(css.getSpacing('md')) *
				Number.parseFloat(getComputedStyle(element).fontSize);

			columnHeight = Math.max(
				minimumColumnHeight,
				containerHeight - offset - panelBottom - gap / 2
			);
		};

		update();

		const observer = new ResizeObserver(update);
		observer.observe(element.parentElement ?? element);
		window.addEventListener('resize', update);

		return () => {
			observer.disconnect();
			window.removeEventListener('resize', update);
		};
	});

	// Report how many columns the players wrapped into, so that siblings such as card
	// lists can grow proportionally.
	$effect(() => {
		const element = group;
		if (!element) {
			setColumns(1);
			return;
		}

		const measure = () => {
			const lefts = new Set(
				Array.from(element.children, (child) => Math.round(child.getBoundingClientRect().left))
			);
			setColumns(Math.max(1, lefts.size));
		};

		measure();

		const observer = new ResizeObserver(measure);
		observer.observe(element);

		return () => observer.disconnect();
	});

	// Give every panel the height of the tallest one, so that the rows of players and their
	// card pills line up across columns.
	$effect(() => {
		const element = group;
		if (!element) return;

		const balance = () => {
			const wrappers = Array.from(element.children) as Array<HTMLElement>;
			for (const wrapper of wrappers) wrapper.style.removeProperty('min-height');

			const tallest = wrappers.reduce(
				(height, wrapper) => Math.max(height, wrapper.getBoundingClientRect().height),
				0
			);
			for (const wrapper of wrappers) wrapper.style.minHeight = `${tallest}px`;
		};

		balance();

		const observer = new ResizeObserver(balance);
		for (const child of element.children) observer.observe(child);

		return () => observer.disconnect();
	});
</script>

{#if players.length > 0}
	<div
		class={styles.group}
		bind:this={group}
		style:max-height={`${columnHeight}px`}
		data-simulator-player-group
	>
		{#each players as player (player.id)}
			<div class={styles.player}>
				<PlayerPanel {simulator} {player} />
			</div>
		{/each}
	</div>
{:else}
	<p class={styles.empty}>{emptyLabel}</p>
{/if}
