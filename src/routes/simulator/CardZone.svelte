<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		zone: {
			...css.column('xs'),
			position: 'relative',
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
		cards: {
			...css.grid('xs'),
			minHeight: '1.5em'
		},
		pileCards: {
			...css.row('xs'),
			flex: '1 1 auto',
			alignItems: 'center',
			justifyContent: 'center',
			minHeight: 0,
			overflow: 'hidden'
		},
		empty: {
			margin: 0,
			fontSize: '0.85em',
			fontStyle: 'italic',
			color: css.text.subtleColor
		},
		emptyIcon: {
			alignSelf: 'center',
			width: '50%',
			height: 'auto',
			color: css.palette.moonMist
		}
	});
</script>

<script lang="ts">
	import { cx } from '@emotion/css';
	import { cardsCatalog } from '#lib/data/catalog';
	import InlineSvg from '#lib/components/InlineSvg.svelte';
	import type { CardRef, Zone } from './types';
	import type { SimulatorState } from './simulatorstate.svelte';
	import { cardDropHandlers } from './cardDrop';
	import CardPill from './CardPill.svelte';
	import CountBadge from './CountBadge.svelte';

	interface Props {
		simulator: SimulatorState;
		cards: Array<CardRef>;
		zone: Zone;
		label?: string;
		ariaLabel?: string;
		emptyLabel?: string;
		emptyIcon?: string;
		pile?: boolean;
		height?: string;
	}

	const {
		simulator,
		cards,
		zone,
		label,
		ariaLabel,
		emptyLabel,
		emptyIcon,
		pile = false,
		height
	}: Props = $props();

	let isOver = $state(false);

	const drop = cardDropHandlers({
		simulator: () => simulator,
		zone: () => zone,
		onOverChange: (value) => (isOver = value)
	});
</script>

<div
	class={cx(styles.zone, isOver && styles.over)}
	role="group"
	aria-label={ariaLabel ?? label}
	style:height={pile ? height : undefined}
	ondragover={drop.ondragover}
	ondragleave={drop.ondragleave}
	ondrop={drop.ondrop}
>
	{#if label}
		<div class={styles.header}>
			<span>{label}</span>
			{#if !pile}
				<span class={styles.count}>{cards.length}</span>
			{/if}
		</div>
	{/if}
	{#if pile}
		<div class={cx(styles.cards, styles.pileCards)} role="list">
			{#if cards.length > 0}
				{@const top = cards[cards.length - 1]}
				{@const card = cardsCatalog.byId(top.cardId)}
				{#if card}
					<CardPill {card} source={zone} uid={top.uid} />
				{/if}
			{:else if emptyIcon}
				<InlineSvg class={styles.emptyIcon} src={emptyIcon} aria-hidden="true" />
			{:else if emptyLabel}
				<p class={styles.empty}>{emptyLabel}</p>
			{/if}
		</div>
		<CountBadge count={cards.length} />
	{:else}
		<div class={styles.cards} role="list">
			{#each cards as ref (ref.uid)}
				{@const card = cardsCatalog.byId(ref.cardId)}
				{#if card}
					<CardPill {card} source={zone} uid={ref.uid} />
				{/if}
			{/each}
			{#if cards.length === 0 && emptyLabel}
				<p class={styles.empty}>{emptyLabel}</p>
			{/if}
		</div>
	{/if}
</div>
