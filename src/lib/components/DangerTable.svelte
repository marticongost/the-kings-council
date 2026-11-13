<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		dangerTable: {
			'th, td': {
				width: '50%',
				textAlign: 'center'
			}
		}
	});

	const rows = [
		{ turns: '1-4', danger: 1 },
		{ turns: '5-7', danger: 2 },
		{ turns: '8-10', danger: 3 }
	];
</script>

<script lang="ts">
	import Table, { type Props as TableProps } from './Table.svelte';
	import { standardAttributes } from './utils';

	export type Props = Omit<TableProps, 'children'>;

	const { ...attributes }: Props = $props();
</script>

<Table {...standardAttributes(attributes, styles.dangerTable)}>
	<thead>
		<tr>
			<th>Torn</th>
			<th>Perill</th>
		</tr>
	</thead>
	<tbody>
		{#each rows as row (row.turns)}
			<tr>
				<td>{row.turns}</td>
				<td>{row.danger}</td>
			</tr>
		{/each}
	</tbody>
</Table>
