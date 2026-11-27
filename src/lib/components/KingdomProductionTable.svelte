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

	const indicatorValues = [1, 2, 3, 4, 5] as const;
</script>

<script lang="ts">
	import { productionAmount } from '#lib/models/production';
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
			{#each indicatorValues as value (value)}
				<th class={styles.indicator}>{value}</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each { length: 7 } as _, index (index)}
			<tr>
				<th>{index + 1}</th>
				{#each indicatorValues as value (value)}
					<td class={styles.cell}>{productionAmount(index + 1, value)}</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</Table>
