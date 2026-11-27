<script lang="ts" module>
	import * as css from '#lib/styles';

	const sheetWidth = '210mm';
	const sheetHeight = '148.5mm';

	const slotSize = '16mm';

	/** Width of the column holding the stat values, shared by the four stat groups. */
	const numbersWidth = '12mm';

	/** Height of every group's header, so that the value rows line up across the groups. */
	const headerHeight = '20mm';

	const cellGap = '1.5mm';
	const rowGap = '1.2mm';

	const styles = css.styles({
		sheet: {
			position: 'relative',
			display: 'flex',
			flexDirection: 'column',
			width: sheetWidth,
			height: sheetHeight,
			boxSizing: 'border-box',
			margin: '0 auto',
			backgroundColor: css.palette.white,
			color: css.text.regularColor,
			fontFamily: css.fonts.text,
			breakInside: 'avoid',
			pageBreakInside: 'avoid',
			printColorAdjust: 'exact',
			WebkitPrintColorAdjust: 'exact',
			overflow: 'hidden',
			border: `1px dotted ${css.palette.linen}`
		},
		columns: {
			flex: '1 1 0',
			minHeight: 0,
			display: 'flex'
		},
		numbersColumn: {
			flex: 'none',
			width: numbersWidth,
			display: 'flex',
			flexDirection: 'column',
			gap: rowGap
		},
		column: {
			position: 'relative',
			flex: '1 1 0',
			minWidth: 0,
			display: 'flex',
			flexDirection: 'column',
			gap: rowGap,
			'&:not(:first-child)::before': {
				content: '""',
				position: 'absolute',
				top: 0,
				bottom: 0,
				left: '-0.2mm',
				borderLeft: `0.4mm dotted ${css.palette.gurkha}`
			}
		},
		headerRow: {
			flex: 'none',
			height: headerHeight,
			display: 'flex',
			gap: cellGap,
			alignItems: 'center',
			justifyContent: 'center',
			padding: '0 2.5mm',
			borderBottom: `0.4mm dotted ${css.palette.gurkha}`
		},
		statHeaderLabel: {
			fontSize: '1.2em',
			whiteSpace: 'nowrap'
		},
		rows: {
			flex: '1 1 0',
			minHeight: 0,
			display: 'flex',
			flexDirection: 'column',
			gap: rowGap,
			padding: '0 2.5mm'
		},
		valueRow: {
			flex: '1 1 0',
			minHeight: 0,
			display: 'flex',
			gap: cellGap,
			alignItems: 'center'
		},
		valueNumber: {
			flex: '1 1 auto',
			textAlign: 'center',
			fontSize: '6mm',
			fontWeight: 900,
			lineHeight: 1,
			color: css.palette.wood
		},
		slot: {
			flex: 'none',
			width: slotSize,
			height: slotSize,
			boxSizing: 'border-box',
			borderRadius: '100%',
			border: `0.7mm dashed ${css.palette.gurkha}`
		},
		derived: {
			flex: '1 1 0',
			minWidth: 0,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			gap: '1mm',
			fontSize: '4.8mm',
			lineHeight: 1
		},
		members: {
			position: 'absolute',
			left: '2mm',
			top: '2mm',
			display: 'flex',
			alignItems: 'center',
			gap: '1.5mm',
			fontSize: '5mm',
			fontWeight: 900,
			lineHeight: 1,
			color: css.palette.gurkha
		}
	});
</script>

<script lang="ts">
	import { getCrisisTokenIcon } from '#lib/cardattributes';
	import { getCrisisToken } from '#lib/models/crisis-tokens';
	import type { KingdomStatType } from '#lib/models/kingdomstats';
	import { productionAmount } from '#lib/models/production';
	import type { ResourceType } from '#lib/models/resources';
	import DangerDisplay from './DangerDisplay.svelte';
	import InlineSvg from './InlineSvg.svelte';
	import KingdomStatLabel from './KingdomStatLabel.svelte';
	import ResourceDisplay from './ResourceDisplay.svelte';
	import { standardAttributes, type StandardAttributeProps } from './utils';

	interface Props extends StandardAttributeProps {
		/** Number of kingdom members this sheet is laid out for. */
		players: number;
	}

	interface StatProduction {
		resource: ResourceType;
		/** The stat value driving the production of this resource, derived from the column value. */
		statValue: (value: number) => number;
	}

	interface StatColumn {
		stat: KingdomStatType;
		productions: Array<StatProduction>;
		retribution: boolean;
	}

	const { players, ...attributes }: Props = $props();

	const identity = (value: number): number => value;

	const stats: Array<StatColumn> = [
		{
			stat: 'stability',
			productions: [
				{ resource: 'power', statValue: identity },
				{ resource: 'intrigue', statValue: (value) => 6 - value }
			],
			retribution: false
		},
		{
			stat: 'wealth',
			productions: [{ resource: 'gold', statValue: identity }],
			retribution: false
		},
		{
			stat: 'might',
			productions: [{ resource: 'strength', statValue: identity }],
			retribution: false
		},
		{
			stat: 'grace',
			productions: [{ resource: 'faith', statValue: identity }],
			retribution: true
		}
	];

	/** Stat values from highest to lowest, as they are laid out top to bottom. */
	const values = [5, 4, 3, 2, 1] as const;

	const retributionIcon = getCrisisTokenIcon(getCrisisToken('retribution'));

	function retributionDanger(value: number): number {
		switch (value) {
			case 1:
				return 3;
			case 2:
				return 2;
			case 3:
				return 1;
			case 4:
				return 0;
			case 5:
				return -1;
			default:
				throw new Error('Invalid stat value');
		}
	}
</script>

<section {...standardAttributes(attributes, styles.sheet)}>
	<div class={styles.columns}>
		<div class={styles.numbersColumn}>
			<div class={styles.headerRow}></div>
			<div class={styles.rows}>
				{#each values as value (value)}
					<div class={styles.valueRow}>
						<span class={styles.valueNumber}>{value}</span>
					</div>
				{/each}
			</div>
		</div>

		{#each stats as column (column.stat)}
			<div class={styles.column}>
				<div class={styles.headerRow}>
					<KingdomStatLabel class={styles.statHeaderLabel} stat={column.stat} />
				</div>

				<div class={styles.rows}>
					{#each values as value (value)}
						<div class={styles.valueRow}>
							<div class={styles.slot}></div>
							{#each column.productions as production (production.resource)}
								<div class={styles.derived}>
									<ResourceDisplay
										resource={production.resource}
										amount={productionAmount(players, production.statValue(value))}
									/>
								</div>
							{/each}
							{#if column.retribution}
								<div class={styles.derived}>
									<InlineSvg
										style="--svg-height: 6.3mm"
										src={retributionIcon}
										role="img"
										aria-label="Retribució"
									/>
									<DangerDisplay danger={retributionDanger(value)} />
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<div class={styles.members}>
		<InlineSvg style="--svg-height: 4.5mm" src="keywords/kingdom-members.svg" />
		{players}
	</div>
</section>
