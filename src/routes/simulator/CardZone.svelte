<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		cards: {
			...css.grid('xs'),
			minHeight: '1.5em'
		},
		columns: {
			display: 'grid',
			gridTemplateColumns: 'repeat(var(--zone-columns, 1), minmax(0, 1fr))',
			alignItems: 'start'
		},
		pileZone: {
			...css.column('xs')
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
	import type { Snippet } from 'svelte';
	import { cardsCatalog } from '#lib/data/catalog';
	import InlineSvg from '#lib/components/InlineSvg.svelte';
	import type { CardRef, Zone } from './types';
	import type { SimulatorState } from './simulatorstate.svelte';
	import { cardDropHandlers } from './cardDrop';
	import CardPill from './CardPill.svelte';
	import CountBadge from './CountBadge.svelte';
	import PanelSection from './PanelSection.svelte';

	interface Props {
		simulator: SimulatorState;
		cards: Array<CardRef>;
		zone: Zone;
		label?: string;
		ariaLabel?: string;
		emptyLabel?: string;
		emptyIcon?: string;
		pile?: boolean;
		/** Lays the cards out in a fixed number of columns instead of a wrapping row. */
		columns?: number;
		height?: string;
		/** Extra controls rendered in the header, after the label. */
		actions?: Snippet;
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
		columns,
		height,
		actions
	}: Props = $props();

	let isOver = $state(false);

	const drop = cardDropHandlers({
		simulator: () => simulator,
		zone: () => zone,
		onOverChange: (value) => (isOver = value)
	});
</script>

<PanelSection
	title={label}
	ariaLabel={ariaLabel ?? label}
	role="group"
	{isOver}
	style={pile && height ? `height: ${height}` : undefined}
	contentClass={pile ? styles.pileZone : undefined}
	{actions}
	ondragover={drop.ondragover}
	ondragleave={drop.ondragleave}
	ondrop={drop.ondrop}
>
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
		<div
			class={cx(styles.cards, columns != null && styles.columns)}
			style={columns != null ? `--zone-columns: ${columns}` : undefined}
			role="list"
		>
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
</PanelSection>
