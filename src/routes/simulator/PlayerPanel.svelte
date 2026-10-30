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
		field: {
			...css.column('xs')
		},
		fieldLabel: {
			fontSize: '0.8em',
			fontWeight: 900,
			textTransform: 'uppercase',
			letterSpacing: '0.05em',
			color: css.text.subtleColor
		},
		select: {
			height: css.forms.controlHeight,
			...css.hpadding('sm'),
			border: css.forms.controlBorder,
			borderRadius: css.spacing.xs,
			backgroundColor: css.forms.controlBackgroundColor,
			fontFamily: css.fonts.text,
			fontSize: '1em',
			color: css.text.regularColor,
			...css.focus.mixin
		},
		resources: {
			...css.row('lg'),
			flexWrap: 'nowrap',
			overflow: 'hidden'
		},
		resourceIcon: {
			height: '2em',
			width: 'auto',
			color: css.palette.dawn,
			flexShrink: 0
		},
		capabilities: {
			...css.column('xs')
		},
		capabilityHeader: {
			...css.row('sm'),
			fontSize: '0.8em',
			fontWeight: 900,
			textTransform: 'uppercase',
			letterSpacing: '0.05em',
			color: css.text.subtleColor
		},
		capabilityCount: {
			marginLeft: 'auto',
			fontWeight: 400
		},
		capabilityGrid: {
			...css.grid('xs')
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
	import InlineSvg from '#lib/components/InlineSvg.svelte';
	import { getResource } from '#lib/models/resources';
	import CardZone from './CardZone.svelte';
	import Counter from './Counter.svelte';
	import OfficeZone from './OfficeZone.svelte';
	import SimulatorCard from './SimulatorCard.svelte';
	import type { SimulatorState } from './simulatorstate.svelte';
	import { playerResourceTypes, type PlayerState } from './types';

	interface Props {
		simulator: SimulatorState;
		player: PlayerState;
	}

	const { simulator, player }: Props = $props();

	const capabilities = $derived(simulator.capabilitiesOf(player));
</script>

<article class={styles.panel}>
	<header class={styles.header}>
		<input
			class={styles.nameInput}
			value={player.name}
			aria-label="Nom del jugador"
			oninput={(event) => simulator.renamePlayer(player.id, event.currentTarget.value)}
		/>
		<Button onclick={() => simulator.removePlayer(player.id)}>Elimina</Button>
	</header>

	<label class={styles.field}>
		<span class={styles.fieldLabel}>Regne</span>
		<select
			class={styles.select}
			value={player.kingdomId ?? ''}
			onchange={(event) => simulator.assignKingdom(player.id, event.currentTarget.value || null)}
		>
			<option value="">Sense regne</option>
			{#each simulator.kingdoms as kingdom (kingdom.id)}
				<option value={kingdom.id}>{kingdom.name}</option>
			{/each}
		</select>
	</label>

	<div class={styles.resources}>
		{#each playerResourceTypes as resource (resource)}
			<Counter
				value={player.resources[resource]}
				label={getResource(resource).title}
				min={0}
				onchange={(value) => simulator.setResource(player.id, resource, value)}
			>
				{#snippet icon()}
					<InlineSvg class={styles.resourceIcon} src={`resources/${resource}.svg`} />
				{/snippet}
			</Counter>
		{/each}
	</div>

	<CardZone
		{simulator}
		cards={player.hand}
		zone={{ kind: 'hand', playerId: player.id }}
		label="Mà"
		emptyLabel="Sense cartes"
	/>

	<OfficeZone
		{simulator}
		offices={player.offices}
		zone={{ kind: 'player-offices', playerId: player.id }}
		emptyLabel="Sense càrrecs"
	/>

	<section class={styles.capabilities}>
		<header class={styles.capabilityHeader}>
			<span>Capacitats</span>
			<span class={styles.capabilityCount}>{capabilities.length}</span>
		</header>
		{#if capabilities.length > 0}
			<div class={styles.capabilityGrid} role="list">
				{#each capabilities as capability (capability.id)}
					<SimulatorCard cardCapability={capability} />
				{/each}
			</div>
		{:else}
			<p class={styles.empty}>Sense capacitats</p>
		{/if}
	</section>
</article>
