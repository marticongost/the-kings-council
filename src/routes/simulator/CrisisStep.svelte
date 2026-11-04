<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		crisisStep: {
			...css.column('sm'),
			minWidth: 0
		},
		kingdom: {
			marginLeft: 'auto',
			color: css.text.subtleColor
		},
		header: {
			...css.row('sm'),
			minWidth: 0
		},
		crisis: {},
		icon: {
			height: '1.3em',
			width: 'auto',
			flexShrink: 0,
			color: css.palette.crisis
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
		progress: {
			flexShrink: 0,
			fontFamily: css.fonts.number,
			fontWeight: 900,
			color: css.palette.wood,
			whiteSpace: 'nowrap'
		},
		rows: {
			...css.column('xs'),
			margin: 0,
			padding: 0,
			listStyle: 'none'
		},
		row: {
			...css.row('md'),
			alignItems: 'center',
			justifyContent: 'space-between',
			flexWrap: 'wrap',
			gap: css.spacing.xs
		},
		highlightSuccess: {
			...css.hpadding('sm'),
			borderRadius: '0.3em',
			color: css.palette.white,
			backgroundColor: css.palette.green
		},
		highlightFailure: {
			...css.hpadding('sm'),
			borderRadius: '0.3em',
			color: css.palette.white,
			backgroundColor: css.palette.red
		},
		counters: {
			...css.row('sm'),
			alignItems: 'center',
			flexWrap: 'wrap',
			justifyContent: 'flex-end'
		},
		pay: {
			...css.row('sm'),
			justifyContent: 'flex-end'
		},
		outcome: {
			...css.row('sm'),
			alignItems: 'flex-start',
			border: '1px solid currentColor',
			borderRadius: css.spacing.xs,
			borderLeftWidth: '3px',
			padding: css.spacing.sm,
			lineHeight: '1em'
		},
		reward: {
			color: css.palette.grass
		},
		penalty: {
			color: css.palette.rose
		},
		outcomeIcon: {
			flex: '0 0 auto',
			position: 'relative',
			top: '0.2em'
		},
		outcomeValue: {
			color: css.text.regularColor
		}
	});
</script>

<script lang="ts">
	import { cx } from '@emotion/css';
	import { getCardIcon } from '#lib/cardattributes';
	import Button from '#lib/components/Button.svelte';
	import EffectsText from '#lib/components/EffectsText.svelte';
	import InlineSvg from '#lib/components/InlineSvg.svelte';
	import ResourceDisplay from '#lib/components/ResourceDisplay.svelte';
	import { crisisContributionResources } from './crisiscontributions';
	import { evaluateCrisisDifficulty } from './crisisdifficulty';
	import PlayerChip from './PlayerChip.svelte';
	import type { SimulatorState } from './simulatorstate.svelte';
	import type { PlayerResourceType } from './types';

	interface Props {
		simulator: SimulatorState;
		kingdomId: string;
	}

	const { simulator, kingdomId }: Props = $props();

	const kingdom = $derived(
		simulator.kingdoms.find((candidate) => candidate.id === kingdomId) ?? null
	);
	const crisis = $derived(kingdom ? simulator.kingdomCrisis(kingdom.id) : null);
	const resources = $derived(crisis ? crisisContributionResources(crisis) : []);

	const rows = $derived.by(() => {
		if (!kingdom || !crisis) return [];

		const memberOrder = new Map(simulator.turnOrder.map((id, index) => [id, index] as const));

		return simulator
			.membersOf(kingdom.id)
			.map((player) => {
				const amounts = {} as Record<PlayerResourceType, number>;
				const effective = simulator.crisisContributionFor(player, kingdomId, crisis);
				let total = 0;

				for (const resource of resources) {
					const amount = effective[resource] ?? 0;
					amounts[resource] = amount;
					total += amount;
				}

				return { player, amounts, total };
			})
			.sort(
				(a, b) =>
					b.total - a.total ||
					(memberOrder.get(a.player.id) ?? Number.MAX_SAFE_INTEGER) -
						(memberOrder.get(b.player.id) ?? Number.MAX_SAFE_INTEGER)
			);
	});

	const defense = $derived(rows.reduce((sum, row) => sum + row.total, 0));
	const difficulty = $derived(
		kingdom && crisis
			? evaluateCrisisDifficulty(crisis, {
					members: simulator.membersOf(kingdom.id).length,
					danger: simulator.danger,
					stats: kingdom.stats
				})
			: null
	);
	const succeeded = $derived(difficulty !== null && defense >= difficulty);

	/** Players at the extreme the crisis outcome points at: highest when averted, lowest otherwise. */
	const highlighted = $derived.by(() => {
		if (rows.length === 0) return new Set<string>();
		const target = succeeded
			? Math.max(...rows.map((row) => row.total))
			: Math.min(...rows.map((row) => row.total));
		return new Set(rows.filter((row) => row.total === target).map((row) => row.player.id));
	});
</script>

{#if kingdom && crisis}
	<div class={styles.crisisStep}>
		<div class={styles.header}>
			<div class={styles.crisis}>
				<InlineSvg class={styles.icon} src={getCardIcon(crisis)} aria-hidden="true" />
				<span class={styles.title}>{crisis.title}</span>
			</div>
			<span class={styles.progress}>
				({defense} / {difficulty ?? '?'})
			</span>
			<span class={styles.kingdom}>{kingdom.name}</span>
		</div>

		<ol class={styles.rows}>
			{#each rows as row (row.player.id)}
				<li class={styles.row}>
					<PlayerChip
						{simulator}
						player={row.player}
						draggable={false}
						large
						class={highlighted.has(row.player.id)
							? succeeded
								? styles.highlightSuccess
								: styles.highlightFailure
							: undefined}
					/>
					<div class={styles.counters}>
						{#each resources as resource (resource)}
							<ResourceDisplay {resource} amount={row.amounts[resource]} />
						{/each}
					</div>
				</li>
			{/each}
		</ol>

		<div class={styles.pay}>
			<Button
				disabled={kingdom.crisisPaid}
				onclick={() => simulator.payCrisisContributions(kingdomId)}>Pagar contribucions</Button
			>
		</div>

		{#if succeeded}
			<div class={cx(styles.outcome, styles.reward)}>
				<InlineSvg class={styles.outcomeIcon} src="capabilities/reward.svg" aria-hidden="true" />
				<EffectsText class={styles.outcomeValue} effects={crisis.highestContributionReward} />
			</div>
		{:else}
			<div class={cx(styles.outcome, styles.penalty)}>
				<InlineSvg class={styles.outcomeIcon} src="capabilities/penalty.svg" aria-hidden="true" />
				<EffectsText class={styles.outcomeValue} effects={crisis.penalty} />
			</div>
		{/if}
	</div>
{/if}
