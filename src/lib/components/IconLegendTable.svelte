<script lang="ts" module>
	import { parse } from '#lib/models/effects';
	import * as css from '#lib/styles';

	const styles = css.styles({
		iconLegendTable: {},
		icon: {
			textAlign: 'center',
			width: '1%',
			whiteSpace: 'nowrap'
		}
	});

	const rows: Array<{ icon: string; description: string }> = [
		{ icon: 'visible', description: 'Carta visible als altres jugadors' },
		{ icon: 'hidden', description: 'Carta només visible al seu propietari' },
		{ icon: 'player', description: 'Un jugador' },
		{ icon: 'players', description: 'Múltiples jugadors' },
		{ icon: 'kingdom', description: 'Regne' },
		{ icon: 'kingdom-member', description: 'Un membre del regne' },
		{ icon: 'kingdom-members', description: 'Múltiples membres del regne' },
		{
			icon: 'kingdom-stat-friction',
			description: 'Fricció (cost addicional) per modificar un {kingdom-stat}'
		},
		{ icon: 'danger', description: 'Perill - risc i càstig creixent a mida que avança el joc' },
		{ icon: 'gold', description: 'Recurs (Or)' },
		{ icon: 'power', description: 'Recurs (Poder)' },
		{ icon: 'strength', description: 'Recurs (Força)' },
		{ icon: 'faith', description: 'Recurs (Fè)' },
		{ icon: 'intrigue', description: 'Recurs (Intriga)' },
		{ icon: 'favour', description: 'Recurs (Favor)' },
		{ icon: 'any', description: 'Recurs (Qualsevol)' },
		{ icon: 'prestige', description: 'Prestigi' },
		{ icon: 'stability', description: 'Indicador del regne (Estabilitat)' },
		{ icon: 'wealth', description: 'Indicador del regne (Riquesa)' },
		{ icon: 'might', description: 'Indicador del regne (Exèrcit)' },
		{ icon: 'grace', description: 'Indicador del regne (Gràcia)' },
		{ icon: 'action', description: 'Capacitat (Acció)' },
		{ icon: 'secret', description: 'Capacitat (Secret)' },
		{ icon: 'reaction', description: 'Capacitat (Reacció)' },
		{ icon: 'indication', description: 'Capacitat (Indicació)' },
		{ icon: 'constant', description: 'Capacitat (Constant)' }
	];
</script>

<script lang="ts">
	import EffectsChunks from './EffectsChunks.svelte';
	import Table, { type Props as TableProps } from './Table.svelte';
	import { standardAttributes } from './utils';

	export type Props = Omit<TableProps, 'children'>;

	const { ...attributes }: Props = $props();
</script>

<Table {...standardAttributes(attributes, styles.iconLegendTable)}>
	<thead>
		<tr>
			<th class={styles.icon}>Icona</th>
			<th>Significat</th>
		</tr>
	</thead>
	<tbody>
		{#each rows as row (row.icon)}
			<tr>
				<td class={styles.icon}><EffectsChunks chunks={parse(`{${row.icon}}`)} /></td>
				<td><EffectsChunks chunks={parse(row.description)} /></td>
			</tr>
		{/each}
	</tbody>
</Table>
