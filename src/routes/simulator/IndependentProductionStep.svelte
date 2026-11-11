<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		independentStep: {
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
		hint: {
			margin: 0,
			fontSize: '0.85em',
			fontStyle: 'italic',
			color: css.text.subtleColor
		},
		rows: {
			...css.column('sm'),
			margin: 0,
			padding: 0,
			listStyle: 'none'
		},
		row: {
			...css.column('xs')
		},
		choices: {
			...css.row('xs'),
			flexWrap: 'wrap'
		},
		choice: {
			...css.row('xs'),
			alignItems: 'center',
			height: css.forms.controlHeight,
			padding: css.spacing.sm,
			border: css.forms.controlBorder,
			borderRadius: css.spacing.sm,
			backgroundColor: css.palette.carrara,
			color: css.palette.wood,
			fontFamily: css.fonts.text,
			fontSize: '0.85em',
			cursor: 'pointer',
			...css.focus.mixin,
			'&:hover': {
				backgroundColor: css.palette.ivory
			}
		},
		choiceSelected: {
			backgroundColor: css.palette.willow,
			borderColor: css.palette.grass,
			color: css.palette.green
		},
		choiceIcon: {
			height: '1em',
			width: 'auto',
			flexShrink: 0
		},
		actions: {
			...css.row('sm'),
			justifyContent: 'flex-end'
		}
	});
</script>

<script lang="ts">
	import { cx } from '@emotion/css';
	import Button from '#lib/components/Button.svelte';
	import InlineSvg from '#lib/components/InlineSvg.svelte';
	import { getResource } from '#lib/models/resources';
	import { independentProductionResourceTypes, type ProductionResourceType } from './production';
	import PlayerChip from './PlayerChip.svelte';
	import { useTurnResolution } from './resolution.svelte';
	import type { SimulatorState } from './simulatorstate.svelte';
	import type { PlayerState } from './types';

	interface Props {
		simulator: SimulatorState;
	}

	const { simulator }: Props = $props();

	const resolution = useTurnResolution();

	const players = $derived.by(() => {
		const order: Record<string, number> = {};
		simulator.turnOrder.forEach((id, index) => {
			order[id] = index;
		});
		return simulator
			.independentPlayers()
			.sort(
				(a, b) =>
					(order[a.id] ?? Number.MAX_SAFE_INTEGER) - (order[b.id] ?? Number.MAX_SAFE_INTEGER)
			);
	});

	const chosen = $derived.by(() => {
		const result: Record<string, Array<ProductionResourceType>> = {};
		for (const player of players) {
			result[player.id] = [...(simulator.production.independent[player.id] ?? [])];
		}
		return result;
	});

	const independentApplied = $derived(simulator.production.independentApplied);
	const canApply = $derived(
		!independentApplied &&
			players.length > 0 &&
			players.every((player) => (chosen[player.id]?.length ?? 0) === 3)
	);

	function toggle(player: PlayerState, resource: ProductionResourceType) {
		const selected = chosen[player.id]?.includes(resource) ?? false;
		simulator.setIndependentProduction(player.id, resource, !selected);
	}

	function distributeAndNext() {
		if (simulator.applyIndependentProduction()) {
			resolution.next();
		}
	}

	function getResourceTitle(resource: ProductionResourceType): string {
		return getResource(resource).title;
	}
</script>

<div class={styles.independentStep}>
	<div class={styles.header}>
		<InlineSvg class={styles.icon} src="keywords/player.svg" aria-hidden="true" />
		<span class={styles.title}>Producció dels jugadors sense regne</span>
	</div>

	<p class={styles.hint}>Cada jugador rep tres recursos, tots de tipus diferents.</p>

	<ol class={styles.rows}>
		{#each players as player (player.id)}
			<li class={styles.row}>
				<PlayerChip {simulator} {player} draggable={false} large />
				<div class={styles.choices}>
					{#each independentProductionResourceTypes as resource (resource)}
						<button
							type="button"
							class={cx(
								styles.choice,
								(chosen[player.id]?.includes(resource) ?? false) && styles.choiceSelected
							)}
							aria-pressed={chosen[player.id]?.includes(resource) ?? false}
							onclick={() => toggle(player, resource)}
						>
							<InlineSvg
								class={styles.choiceIcon}
								src="resources/{resource}.svg"
								aria-hidden="true"
							/>
							<span>{getResourceTitle(resource)}</span>
						</button>
					{/each}
				</div>
			</li>
		{/each}
	</ol>

	<div class={styles.actions}>
		<Button disabled={!canApply} onclick={distributeAndNext}>Repartir</Button>
	</div>
</div>
