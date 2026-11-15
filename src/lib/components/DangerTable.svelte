<script lang="ts" module>
	import { dangerLevels, dangerTurnRange } from '#lib/models/turns';
	import * as css from '#lib/styles';

	const styles = css.styles({
		dangerTable: {
			'th, td': {
				width: '50%',
				textAlign: 'left'
			}
		}
	});
</script>

<script lang="ts">
	import DangerDisplay from './DangerDisplay.svelte';
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
		{#each dangerLevels as level (level.firstTurn)}
			<tr>
				<td>{dangerTurnRange(level)}</td>
				<td><DangerDisplay danger={level.danger} /></td>
			</tr>
		{/each}
	</tbody>
</Table>
