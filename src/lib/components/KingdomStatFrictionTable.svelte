<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		kingdomStatFrictionTable: {
			'th, td': {
				width: '50%',
				textAlign: 'center'
			}
		}
	});

	const rows = [
		{ value: 5, friction: 2 },
		{ value: 4, friction: 1 },
		{ value: 3, friction: 0 },
		{ value: 2, friction: 1 },
		{ value: 1, friction: 2 }
	];
</script>

<script lang="ts">
	import Table, { type Props as TableProps } from './Table.svelte';
	import { standardAttributes } from './utils';

	export type Props = Omit<TableProps, 'children'>;

	const { ...attributes }: Props = $props();
</script>

<Table {...standardAttributes(attributes, styles.kingdomStatFrictionTable)}>
	<thead>
		<tr>
			<th>Nou valor de l'indicador</th>
			<th>Fricció</th>
		</tr>
	</thead>
	<tbody>
		{#each rows as row (row.value)}
			<tr>
				<td>{row.value}</td>
				<td>{row.friction}</td>
			</tr>
		{/each}
	</tbody>
</Table>
