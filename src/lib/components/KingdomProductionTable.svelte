<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		kingdomProductionTable: {},
		indicator: {
			textAlign: 'center'
		},
		cell: {
			textAlign: 'center'
		}
	});

	const indicators = [
		{ value: 1, factor: 0.5 },
		{ value: 2, factor: 1 },
		{ value: 3, factor: 1.5 },
		{ value: 4, factor: 2 },
		{ value: 5, factor: 2.5 }
	];
</script>

<script lang="ts">
	import Table, { type Props as TableProps } from './Table.svelte';
	import { standardAttributes } from './utils';

	export type Props = Omit<TableProps, 'children'>;

	const { ...attributes }: Props = $props();
</script>

<Table {...standardAttributes(attributes, styles.kingdomProductionTable)}>
	<thead>
		<tr>
			<th rowspan="2">Membres</th>
			<th colspan="5">Indicador</th>
		</tr>
		<tr>
			{#each indicators as indicator (indicator.value)}
				<th class={styles.indicator}>{indicator.value}</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each { length: 7 } as _, index (index)}
			<tr>
				<th>{index + 1}</th>
				{#each indicators as indicator (indicator.value)}
					<td class={styles.cell}>{Math.ceil((index + 1) * indicator.factor)}</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</Table>
