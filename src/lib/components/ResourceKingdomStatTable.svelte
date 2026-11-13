<script lang="ts" module>
	import { parse } from '#lib/models/effects';
	import type { ResourceType } from '#lib/models/resources';
	import * as css from '#lib/styles';

	const styles = css.styles({
		resourceKingdomStatTable: {},
		indicator: {}
	});

	const rows: Array<{ resource: ResourceType; indicator: string }> = [
		{ resource: 'gold', indicator: '{wealth-label}' },
		{ resource: 'power', indicator: '{stability-label}' },
		{ resource: 'strength', indicator: '{might-label}' },
		{ resource: 'faith', indicator: '{grace-label}' },
		{ resource: 'intrigue', indicator: '6 - {stability-label}' },
		{ resource: 'favour', indicator: 'El més baix' }
	];
</script>

<script lang="ts">
	import EffectsChunks from './EffectsChunks.svelte';
	import ResourceLabel from './ResourceLabel.svelte';
	import Table, { type Props as TableProps } from './Table.svelte';
	import { standardAttributes } from './utils';

	export type Props = Omit<TableProps, 'children'>;

	const { ...attributes }: Props = $props();
</script>

<Table {...standardAttributes(attributes, styles.resourceKingdomStatTable)}>
	<thead>
		<tr>
			<th>Recurs</th>
			<th class={styles.indicator}>Indicador</th>
		</tr>
	</thead>
	<tbody>
		{#each rows as row (row.resource)}
			<tr>
				<td><ResourceLabel resource={row.resource} /></td>
				<td class={styles.indicator}><EffectsChunks chunks={parse(row.indicator)} /></td>
			</tr>
		{/each}
	</tbody>
</Table>
