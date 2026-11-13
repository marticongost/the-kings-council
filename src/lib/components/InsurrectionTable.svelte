<script lang="ts" module>
	import { parse } from '#lib/models/effects';
	import * as css from '#lib/styles';

	const styles = css.styles({
		insurrectionTable: {},
		center: {
			textAlign: 'center'
		}
	});

	const dice = 2;

	/** Number of kingdom stats that can be at their minimum value. */
	const disarrayLevels = [1, 2, 3, 4];

	interface Outcome {
		successes: number;
		label: string;
	}

	const outcomes: Outcome[] = [
		{ successes: 2, label: 'La insurrecció fracassa, sense més efectes' },
		{ successes: 1, label: 'El {king} és {exiled}' },
		{ successes: 0, label: 'El {king} és {executed}' }
	];

	const percentFormat = new Intl.NumberFormat('ca', { maximumFractionDigits: 1 });

	/**
	 * Chance of rolling exactly `successes` successes with `dice` dice, where a die succeeds
	 * when its result is above `target` (the number of kingdom stats at value 1).
	 */
	function probability(target: number, successes: number): number {
		const success = (6 - target) / 6;
		const failure = 1 - success;
		const none = failure ** dice;
		const once = dice * success * failure ** (dice - 1);

		if (successes === 0) {
			return none;
		}
		if (successes === 1) {
			return once;
		}
		return 1 - none - once;
	}

	const rows = outcomes.map((outcome) => ({
		...outcome,
		chances: disarrayLevels.map((level) => probability(level, outcome.successes))
	}));

	function asPercent(value: number): string {
		return `${percentFormat.format(value * 100)}%`;
	}
</script>

<script lang="ts">
	import EffectsChunks from './EffectsChunks.svelte';
	import Table, { type Props as TableProps } from './Table.svelte';
	import { standardAttributes } from './utils';

	export type Props = Omit<TableProps, 'children'>;

	const { ...attributes }: Props = $props();
</script>

<Table {...standardAttributes(attributes, styles.insurrectionTable)}>
	<thead>
		<tr>
			<th rowspan="2">Èxits</th>
			<th rowspan="2">Resultat</th>
			<th colspan={disarrayLevels.length}>Probabilitat (indicadors amb valor 1)</th>
		</tr>
		<tr>
			{#each disarrayLevels as level (level)}
				<th class={styles.center}>{level}</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each rows as row (row.successes)}
			<tr>
				<th class={styles.center}>{row.successes}</th>
				<td><EffectsChunks chunks={parse(row.label)} /></td>
				{#each row.chances as chance, index (index)}
					<td class={styles.center}>{asPercent(chance)}</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</Table>
