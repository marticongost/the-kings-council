<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		zone: {
			...css.column('xs'),
			padding: css.spacing.sm,
			border: `2px dashed ${css.palette.moonMist}`,
			borderRadius: css.spacing.sm,
			backgroundColor: css.palette.linen,
			transition: 'border-color 0.15s, background-color 0.15s',
			minWidth: 0
		},
		over: {
			borderColor: css.palette.sandal,
			backgroundColor: css.palette.wheat
		},
		header: {
			...css.row('sm'),
			fontSize: '0.9em',
			fontWeight: 900,
			color: css.palette.wood
		},
		count: {
			marginLeft: 'auto',
			fontWeight: 400,
			color: css.text.subtleColor
		},
		pills: {
			...css.grid('xs'),
			minHeight: '1.5em'
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
	import { officeTypes } from '#lib/models/offices';
	import type { SimulatorState } from './simulatorstate.svelte';
	import OfficePill from './OfficePill.svelte';
	import { simulatorDragMime, type CardRef, type DragPayload, type Zone } from './types';

	// Keep pills in the canonical office order regardless of assignment history.
	const officeOrder = new Map<string, number>(officeTypes.map((type, index) => [type, index]));

	interface Props {
		simulator: SimulatorState;
		offices: Array<CardRef>;
		zone: Zone;
		label?: string;
		emptyLabel?: string;
	}

	const { simulator, offices, zone, label = 'Càrrecs', emptyLabel }: Props = $props();

	let isOver = $state(false);

	const orderedOffices = $derived(
		[...offices].sort(
			(a, b) =>
				(officeOrder.get(a.cardId) ?? Number.MAX_SAFE_INTEGER) -
				(officeOrder.get(b.cardId) ?? Number.MAX_SAFE_INTEGER)
		)
	);

	function hasSimulatorPayload(event: DragEvent): boolean {
		return event.dataTransfer?.types.includes(simulatorDragMime) ?? false;
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
			simulator.moveCard(payload.source, zone, payload.uid);
		} catch {
			// Ignore malformed payloads from outside the simulator.
		}
	}
</script>

<section
	class={cx(styles.zone, isOver && styles.over)}
	role="group"
	aria-label={label}
	ondragover={onDragOver}
	ondragleave={onDragLeave}
	ondrop={onDrop}
>
	<header class={styles.header}>
		<span>{label}</span>
		<span class={styles.count}>{offices.length}</span>
	</header>
	<div class={styles.pills} role="list">
		{#each orderedOffices as ref (ref.uid)}
			{@const card = simulator.cardOf(ref)}
			{#if card}
				<OfficePill {card} source={zone} uid={ref.uid} />
			{/if}
		{/each}
		{#if offices.length === 0 && emptyLabel}
			<p class={styles.empty}>{emptyLabel}</p>
		{/if}
	</div>
</section>
