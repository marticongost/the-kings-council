<script lang="ts" module>
	import {
		crisisBagForTurn,
		getCrisisTokens,
		perTurnCrisisBagChanges,
		type CrisisToken
	} from '#lib/models/crisis-tokens';
	import { maxTurn, minTurn } from '#lib/models/turns';
	import * as css from '#lib/styles';

	const turns = Array.from({ length: maxTurn - minTurn + 1 }, (_, index) => minTurn + index);
	const tokens = getCrisisTokens();
	const bags = new Map(turns.map((turn) => [turn, crisisBagForTurn(turn)] as const));

	const styles = css.styles({
		// Fixed layout, so every turn column gets the same width.
		dangerBagComposition: {
			tableLayout: 'fixed'
		},
		tokenColumn: {
			width: '9em'
		},
		turn: {
			textAlign: 'center',
			fontFamily: css.fonts.number
		},
		token: {
			textAlign: 'left',
			whiteSpace: 'nowrap'
		},
		cell: {
			position: 'relative',
			textAlign: 'center',
			whiteSpace: 'nowrap'
		},
		amount: {
			fontFamily: css.fonts.number,
			fontWeight: 900
		},
		// Hangs beside the centred amount, so the amount stays centred with or without a delta.
		delta: {
			position: 'absolute',
			left: '50%',
			top: '0.4em',
			marginLeft: '0.45em',
			fontSize: '0.7em',
			fontWeight: 400
		},
		deltaGain: {
			color: css.palette.green
		},
		deltaLoss: {
			color: css.palette.red
		}
	});

	/** How many tokens of a kind a turn adds to the bag, or takes from it. */
	function deltaOf(token: CrisisToken, turn: number): number {
		const changes = perTurnCrisisBagChanges[turn];
		if (!changes) return 0;
		return changes.additions.get(token) - changes.removals.get(token);
	}
</script>

<script lang="ts">
	import { cx } from '@emotion/css';
	import CrisisTokenLabel from './CrisisTokenLabel.svelte';
	import Table, { type Props as TableProps } from './Table.svelte';
	import { standardAttributes } from './utils';

	export type Props = Omit<TableProps, 'children'>;

	const { ...attributes }: Props = $props();
</script>

<Table {...standardAttributes(attributes, styles.dangerBagComposition)}>
	<colgroup>
		<col class={styles.tokenColumn} />
		{#each turns as turn (turn)}
			<col />
		{/each}
	</colgroup>
	<thead>
		<tr>
			<th rowspan="2">Fitxa</th>
			<th colspan={turns.length}>Torn</th>
		</tr>
		<tr>
			{#each turns as turn (turn)}
				<th class={styles.turn}>{turn}</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each tokens as token (token.id)}
			<tr>
				<th class={styles.token}>
					<CrisisTokenLabel {token} />
				</th>
				{#each turns as turn (turn)}
					{@const delta = deltaOf(token, turn)}
					<td class={styles.cell}>
						<span class={styles.amount}>{bags.get(turn)?.[token.id] ?? 0}</span>
						{#if delta !== 0}
							<sup class={cx(styles.delta, delta > 0 ? styles.deltaGain : styles.deltaLoss)}>
								{delta > 0 ? '+' : ''}{delta}
							</sup>
						{/if}
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</Table>
