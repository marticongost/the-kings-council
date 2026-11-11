<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		assetsBidStep: {
			...css.column('sm'),
			minWidth: 0
		},
		header: {
			...css.row('sm'),
			minWidth: 0
		},
		icon: {
			height: '1.3em',
			width: 'auto',
			flexShrink: 0,
			color: css.palette.sandal
		},
		title: {
			fontFamily: css.fonts.heading,
			fontWeight: 900,
			fontSize: '1.2em',
			color: css.palette.wood,
			minWidth: 0,
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			whiteSpace: 'nowrap'
		},
		assets: {
			...css.column('sm'),
			margin: 0,
			padding: 0,
			listStyle: 'none'
		},
		entry: {
			display: 'grid',
			gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)',
			alignItems: 'center',
			gap: css.spacing.sm,
			minWidth: 0
		},
		asset: {
			...css.column('xs'),
			minWidth: 0
		},
		tie: {
			alignSelf: 'flex-start',
			flexShrink: 0,
			fontFamily: css.fonts.heading,
			fontWeight: 900,
			fontSize: '0.8em',
			color: css.palette.petal
		},
		bids: {
			display: 'grid',
			gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
			gap: css.spacing.xs,
			margin: 0,
			padding: 0,
			listStyle: 'none'
		},
		bid: {
			marginLeft: 'auto',
			flexShrink: 0
		},
		empty: {
			margin: 0,
			fontSize: '0.85em',
			fontStyle: 'italic',
			color: css.text.subtleColor
		},
		actions: {
			...css.row('sm'),
			justifyContent: 'flex-end'
		}
	});
</script>

<script lang="ts">
	import Button from '#lib/components/Button.svelte';
	import InlineSvg from '#lib/components/InlineSvg.svelte';
	import ResourceDisplay from '#lib/components/ResourceDisplay.svelte';
	import type { Card } from '#lib/models/cards';
	import CardPill from './CardPill.svelte';
	import PlayerChip from './PlayerChip.svelte';
	import type { SimulatorState } from './simulatorstate.svelte';
	import type { PlayerState } from './types';

	interface Props {
		simulator: SimulatorState;
		acquisitionIndex: number;
	}

	const { simulator, acquisitionIndex }: Props = $props();

	const title = $derived(acquisitionIndex === 0 ? 'Apostes principals' : 'Apostes secundàries');

	// The round is presented as a single snapshot: resolving the bids updates the game
	// state, but must not redraw the offers shown here.
	function buildEntries() {
		const offers = simulator.assetBidOffers(acquisitionIndex);
		const memberOrder = new Map(simulator.turnOrder.map((id, index) => [id, index] as const));

		const rowsFor = (cardId: string) =>
			offers
				.filter((offer) => offer.cardId === cardId)
				.map((offer) => ({ player: offer.player, gold: offer.gold }))
				.sort(
					(a, b) =>
						b.gold - a.gold ||
						a.player.resources.prestige - b.player.resources.prestige ||
						(memberOrder.get(a.player.id) ?? Number.MAX_SAFE_INTEGER) -
							(memberOrder.get(b.player.id) ?? Number.MAX_SAFE_INTEGER)
				);

		const marketIds = new Set(simulator.market.map((ref) => ref.cardId));
		const result: Array<{
			ref: { uid: string; cardId: string };
			card: Card;
			rows: Array<{ player: PlayerState; gold: number }>;
			winner: PlayerState | null;
			lost: boolean;
		}> = [];

		for (const ref of simulator.market) {
			const card = simulator.cardOf(ref);
			if (!card) continue;
			const rows = rowsFor(card.id);
			if (rows.length === 0) continue;
			result.push({
				ref,
				card,
				rows,
				winner: simulator.assetBidWinner(acquisitionIndex, card.id),
				lost: false
			});
		}

		if (acquisitionIndex === 1) {
			for (const offer of offers) {
				if (marketIds.has(offer.cardId) || result.some((entry) => entry.card.id === offer.cardId)) {
					continue;
				}
				const card = simulator.cardOf({ uid: '', cardId: offer.cardId });
				if (!card) continue;
				result.push({
					ref: { uid: `lost-${offer.cardId}`, cardId: offer.cardId },
					card,
					rows: rowsFor(offer.cardId),
					winner: null,
					lost: true
				});
			}
		}

		return result;
	}

	const entries = buildEntries();
	const movableCount = entries.filter((entry) => entry.winner !== null).length;
</script>

<div class={styles.assetsBidStep}>
	<div class={styles.header}>
		<InlineSvg class={styles.icon} src="resources/gold.svg" aria-hidden="true" />
		<span class={styles.title}>{title}</span>
	</div>

	<ol class={styles.assets}>
		{#each entries as entry (entry.ref.uid)}
			<li class={styles.entry}>
				<div class={styles.asset}>
					<CardPill card={entry.card} />
				</div>
				<ol class={styles.bids}>
					{#each entry.rows as row (row.player.id)}
						<li>
							<PlayerChip
								{simulator}
								player={row.player}
								draggable={false}
								ready={false}
								status={entry.winner?.id === row.player.id ? 'winner' : 'loser'}
							>
								<ResourceDisplay class={styles.bid} resource="gold" amount={row.gold} />
							</PlayerChip>
						</li>
					{/each}
				</ol>
			</li>
		{:else}
			<p class={styles.empty}>Cap aposta</p>
		{/each}
	</ol>

	<div class={styles.actions}>
		<Button
			disabled={movableCount === 0}
			onclick={() => simulator.resolveAssetBids(acquisitionIndex)}>Repartir actius</Button
		>
	</div>
</div>
