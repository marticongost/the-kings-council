<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		panel: {
			...css.column('sm'),
			padding: css.spacing.sm,
			border: `1px solid ${css.palette.moonMist}`,
			borderRadius: css.spacing.sm,
			backgroundColor: css.palette.white,
			transition: 'border-color 0.15s, background-color 0.15s',
			minWidth: 0
		},
		over: {
			borderColor: css.palette.sandal,
			backgroundColor: css.palette.wheat
		},
		header: {
			...css.row('lg'),
			flexWrap: 'wrap'
		},
		name: {
			margin: 0,
			fontFamily: css.fonts.heading,
			fontWeight: 900,
			fontSize: '1.5em',
			lineHeight: 1.2,
			color: css.palette.cedar,
			whiteSpace: 'nowrap'
		},
		kingdom: {
			flex: '0 1 auto',
			minWidth: 0,
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
		offices: {
			flex: '1 1 auto',
			minWidth: 0
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
	import { cx } from '@emotion/css';
	import Button from '#lib/components/Button.svelte';
	import InlineSvg from '#lib/components/InlineSvg.svelte';
	import { getResource } from '#lib/models/resources';
	import CardZone from './CardZone.svelte';
	import Counter from './Counter.svelte';
	import OfficeList from './OfficeList.svelte';
	import { officeDropHandlers } from './officeDrop';
	import CardPill from './CardPill.svelte';
	import type { SimulatorState } from './simulatorstate.svelte';
	import { playerResourceTypes, type PlayerState } from './types';

	interface Props {
		simulator: SimulatorState;
		player: PlayerState;
	}

	const { simulator, player }: Props = $props();

	const capabilities = $derived(simulator.capabilitiesOf(player));

	let isOver = $state(false);

	const drop = officeDropHandlers({
		simulator: () => simulator,
		zone: () => ({ kind: 'player-offices', playerId: player.id }),
		onOverChange: (value) => (isOver = value)
	});
</script>

<article
	class={cx(styles.panel, isOver && styles.over)}
	ondragover={drop.ondragover}
	ondragleave={drop.ondragleave}
	ondrop={drop.ondrop}
>
	<header class={styles.header}>
		<h3 class={styles.name}>{player.name}</h3>
		<select
			class={styles.kingdom}
			aria-label="Regne"
			value={player.kingdomId ?? ''}
			onchange={(event) => simulator.assignKingdom(player.id, event.currentTarget.value || null)}
		>
			<option value="">Sense regne</option>
			{#each simulator.kingdoms as kingdom (kingdom.id)}
				<option value={kingdom.id}>{kingdom.name}</option>
			{/each}
		</select>
		<div class={styles.offices}>
			<OfficeList
				{simulator}
				offices={player.offices}
				zone={{ kind: 'player-offices', playerId: player.id }}
			/>
		</div>
		<Button onclick={() => simulator.removePlayer(player.id)}>Elimina</Button>
	</header>

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

	<section class={styles.capabilities}>
		<header class={styles.capabilityHeader}>
			<span>Capacitats</span>
			<span class={styles.capabilityCount}>{capabilities.length}</span>
		</header>
		{#if capabilities.length > 0}
			<div class={styles.capabilityGrid} role="list">
				{#each capabilities as capability (capability.id)}
					<CardPill cardCapability={capability} />
				{/each}
			</div>
		{:else}
			<p class={styles.empty}>Sense capacitats</p>
		{/if}
	</section>
</article>
