<script lang="ts" module>
	import { parse } from '#lib/models/effects';
	import type { OfficeType } from '#lib/models/offices';
	import type { ResourceType } from '#lib/models/resources';
	import * as css from '#lib/styles';

	const styles = css.styles({
		resourceResponsibleTable: {},
		responsible: {}
	});

	const rows: Array<{ resource: ResourceType; office: OfficeType }> = [
		{ resource: 'gold', office: 'treasurer' },
		{ resource: 'power', office: 'chancellor' },
		{ resource: 'strength', office: 'marshal' },
		{ resource: 'faith', office: 'bishop' },
		{ resource: 'intrigue', office: 'spy-master' },
		{ resource: 'favour', office: 'king' }
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

<Table {...standardAttributes(attributes, styles.resourceResponsibleTable)}>
	<thead>
		<tr>
			<th>Recurs</th>
			<th class={styles.responsible}>Responsable</th>
		</tr>
	</thead>
	<tbody>
		{#each rows as row (row.resource)}
			<tr>
				<td><ResourceLabel resource={row.resource} /></td>
				<td class={styles.responsible}>
					<EffectsChunks chunks={parse(`{${row.office}}`)} />
				</td>
			</tr>
		{/each}
	</tbody>
</Table>
