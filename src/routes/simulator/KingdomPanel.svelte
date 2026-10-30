<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		panel: {
			...css.column('sm'),
			padding: css.spacing.sm,
			border: `1px solid ${css.palette.moonMist}`,
			borderRadius: css.spacing.sm,
			backgroundColor: css.palette.white,
			minWidth: 0
		},
		header: {
			...css.row('sm')
		},
		nameInput: {
			flex: '1 1 auto',
			minWidth: 0,
			height: css.forms.controlHeight,
			...css.hpadding('sm'),
			border: css.forms.controlBorder,
			borderRadius: css.spacing.xs,
			backgroundColor: css.forms.controlBackgroundColor,
			fontFamily: css.fonts.heading,
			fontWeight: 900,
			fontSize: '1.1em',
			color: css.palette.cedar,
			...css.focus.mixin
		},
		stats: {
			...css.row('lg'),
			flexWrap: 'nowrap',
			overflow: 'hidden'
		},
		statIcon: {
			height: '2em',
			width: 'auto',
			backgroundColor: 'transparent',
			color: css.palette.wood,
			padding: 0,
			borderRadius: 0,
			flexShrink: 0
		},
		fieldLabel: {
			fontSize: '0.8em',
			fontWeight: 900,
			textTransform: 'uppercase',
			letterSpacing: '0.05em',
			color: css.text.subtleColor
		},
		members: {
			...css.row('xs'),
			flexWrap: 'wrap',
			minHeight: '1.5em'
		},
		member: {
			padding: `${css.spacing.xs} ${css.spacing.sm}`,
			borderRadius: css.spacing.xs,
			backgroundColor: css.palette.willow,
			color: css.palette.wood,
			fontSize: '0.85em'
		},
		empty: {
			margin: 0,
			fontSize: '0.85em',
			fontStyle: 'italic',
			color: css.text.subtleColor
		}
	});
</script>

<script lang="ts">
	import Button from '#lib/components/Button.svelte';
	import KingdomStatIcon from '#lib/components/KingdomStatIcon.svelte';
	import { getKingdomStat, kingdomStatTypes } from '#lib/models/kingdomstats';
	import Counter from './Counter.svelte';
	import OfficeZone from './OfficeZone.svelte';
	import type { SimulatorState } from './simulatorstate.svelte';
	import { kingdomStatMax, kingdomStatMin, type KingdomState } from './types';

	interface Props {
		simulator: SimulatorState;
		kingdom: KingdomState;
	}

	const { simulator, kingdom }: Props = $props();

	const members = $derived(simulator.membersOf(kingdom.id));
</script>

<article class={styles.panel}>
	<header class={styles.header}>
		<input
			class={styles.nameInput}
			value={kingdom.name}
			aria-label="Nom del regne"
			oninput={(event) => simulator.renameKingdom(kingdom.id, event.currentTarget.value)}
		/>
		<Button onclick={() => simulator.removeKingdom(kingdom.id)}>Elimina</Button>
	</header>

	<div class={styles.stats}>
		{#each kingdomStatTypes as stat (stat)}
			<Counter
				value={kingdom.stats[stat]}
				label={getKingdomStat(stat).title}
				min={kingdomStatMin}
				max={kingdomStatMax}
				onchange={(value) => simulator.setStat(kingdom.id, stat, value)}
			>
				{#snippet icon()}
					<KingdomStatIcon class={styles.statIcon} {stat} />
				{/snippet}
			</Counter>
		{/each}
	</div>

	<div>
		<span class={styles.fieldLabel}>Membres</span>
		<div class={styles.members}>
			{#each members as member (member.id)}
				<span class={styles.member}>{member.name}</span>
			{:else}
				<p class={styles.empty}>Sense membres</p>
			{/each}
		</div>
	</div>

	<OfficeZone
		{simulator}
		offices={kingdom.offices}
		zone={{ kind: 'kingdom-offices', kingdomId: kingdom.id }}
		emptyLabel="Sense càrrecs"
	/>
</article>
