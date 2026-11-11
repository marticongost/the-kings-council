<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		productionStep: {
			...css.column('sm'),
			minWidth: 0
		},
		kingdom: {
			marginLeft: 'auto',
			color: css.text.subtleColor
		},
		header: {
			...css.row('sm'),
			minWidth: 0
		},
		icon: {
			height: '1.3em',
			width: 'auto',
			flexShrink: 0,
			color: css.palette.sandal
		},
		title: {
			fontFamily: css.fonts.heading,
			fontWeight: 900,
			fontSize: '1.2em',
			color: css.palette.wood,
			minWidth: 0,
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			whiteSpace: 'nowrap'
		},
		progress: {
			flexShrink: 0,
			fontFamily: css.fonts.number,
			fontWeight: 900,
			color: css.palette.wood,
			whiteSpace: 'nowrap'
		},
		responsible: {
			...css.row('sm'),
			alignItems: 'center',
			flexWrap: 'wrap',
			gap: css.spacing.sm,
			color: css.text.subtleColor,
			fontSize: '0.9em'
		},
		columns: {
			...css.row('sm'),
			alignItems: 'stretch'
		},
		column: {
			...css.column('xs'),
			flex: 1,
			minWidth: 0,
			padding: css.spacing.sm,
			border: `2px dashed ${css.palette.moonMist}`,
			borderRadius: css.spacing.sm,
			backgroundColor: css.palette.carrara,
			transition: 'border-color 0.15s, background-color 0.15s'
		},
		columnOver: {
			borderColor: css.palette.sandal,
			backgroundColor: css.palette.wheat
		},
		columnHeader: {
			...css.row('xs'),
			alignItems: 'center',
			flexWrap: 'wrap'
		},
		columnLabel: {
			fontFamily: css.fonts.heading,
			fontSize: '0.85em',
			fontWeight: 900,
			color: css.text.subtleColor
		},
		columnIndicator: {
			fontFamily: css.fonts.number,
			fontSize: '1.3em',
			fontWeight: 900,
			color: css.palette.wood
		},
		columnCount: {
			marginLeft: 'auto',
			fontFamily: css.fonts.number,
			fontSize: '0.9em',
			fontWeight: 900,
			color: css.text.subtleColor
		},
		columnList: {
			...css.column('xs'),
			margin: 0,
			padding: 0,
			listStyle: 'none',
			minHeight: '2em'
		},
		rows: {
			...css.column('xs'),
			margin: 0,
			padding: 0,
			listStyle: 'none'
		},
		row: {
			...css.row('md'),
			alignItems: 'center',
			justifyContent: 'space-between',
			flexWrap: 'wrap',
			gap: css.spacing.xs
		},
		actions: {
			...css.row('sm'),
			justifyContent: 'flex-end',
			alignItems: 'center',
			flexWrap: 'wrap'
		},
		privilege: {
			...css.row('xs'),
			alignItems: 'center',
			fontSize: '0.9em',
			color: css.palette.wood,
			cursor: 'pointer'
		},
		checkbox: {
			margin: 0,
			accentColor: css.palette.sandal
		},
		disabled: {
			opacity: 0.35
		}
	});
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { cx } from '@emotion/css';
	import { getResource } from '#lib/models/resources';
	import Button from '#lib/components/Button.svelte';
	import IconButton from '#lib/components/IconButton.svelte';
	import InlineSvg from '#lib/components/InlineSvg.svelte';
	import ResourceDisplay from '#lib/components/ResourceDisplay.svelte';
	import Counter from './Counter.svelte';
	import PlayerChip from './PlayerChip.svelte';
	import type { ProductionResourceType } from './production';
	import { useTurnResolution } from './resolution.svelte';
	import type { SimulatorState } from './simulatorstate.svelte';
	import { playerDragMime, type PlayerDragPayload, type PlayerState } from './types';

	interface Props {
		simulator: SimulatorState;
		kingdomId: string;
		resource: ProductionResourceType;
	}

	const { simulator, kingdomId, resource }: Props = $props();

	const resolution = useTurnResolution();

	const kingdom = $derived.by(
		() => simulator.kingdoms.find((candidate) => candidate.id === kingdomId) ?? null
	);
	const total = $derived.by(() => (kingdom ? simulator.productionAmount(kingdomId, resource) : 0));
	const responsible = $derived.by(() =>
		kingdom ? simulator.productionResponsible(kingdomId, resource) : null
	);
	const isFavour = $derived.by(() => resource === 'favour');
	const applied = $derived.by(() => simulator.productionDistribution(kingdomId, resource).applied);
	const privilege = $derived.by(
		() => simulator.productionDistribution(kingdomId, resource).privilege
	);
	const members = $derived.by(() => (kingdom ? simulator.membersInTurnOrder(kingdomId) : []));
	const base = $derived.by(() => (kingdom ? simulator.productionBase(kingdomId, resource) : 0));
	const extra = $derived.by(() =>
		kingdom ? simulator.productionExtraCount(kingdomId, resource) : 0
	);
	const extras = $derived.by(() => simulator.productionDistribution(kingdomId, resource).extras);

	const rows = $derived.by(() => {
		if (!kingdom) return [];
		const assigned = simulator.productionDistribution(kingdomId, resource).assigned;
		const extrasList = extras;
		return members.map((member) => ({
			member,
			assigned: assigned[member.id] ?? 0,
			inExtras: extrasList.includes(member.id)
		}));
	});

	/** Favour recipients: every member except the king, who cannot receive favour. */
	const favourRecipients = $derived.by(() =>
		isFavour ? rows.filter((row) => row.member.id !== responsible?.id) : rows
	);

	const assignedTotal = $derived.by(() =>
		kingdom ? simulator.productionAssignedTotal(kingdomId, resource) : 0
	);
	const canApply = $derived(!applied && assignedTotal === total);
	const canReset = $derived(
		!applied && (privilege || extras.length > 0 || (isFavour && assignedTotal > 0))
	);

	let baseOver = $state(false);
	let extraOver = $state(false);

	onMount(() => {
		simulator.initializeProductionStep(kingdomId, resource);
	});

	function setAssigned(player: PlayerState, value: number) {
		simulator.setProductionAssigned(kingdomId, resource, player.id, value);
	}

	function togglePrivilege(event: Event) {
		const target = event.currentTarget;
		if (target instanceof HTMLInputElement) {
			simulator.setProductionPrivilege(kingdomId, resource, target.checked);
		}
	}

	function distributeAndNext() {
		if (simulator.applyProduction(kingdomId, resource)) {
			resolution.next();
		}
	}

	function hasPlayerPayload(event: DragEvent): boolean {
		return event.dataTransfer?.types.includes(playerDragMime) ?? false;
	}

	function readPlayerId(event: DragEvent): string | null {
		const raw = event.dataTransfer?.getData(playerDragMime);
		if (!raw) return null;
		try {
			const payload = JSON.parse(raw) as PlayerDragPayload;
			return typeof payload.playerId === 'string' ? payload.playerId : null;
		} catch {
			return null;
		}
	}

	function ondragover(event: DragEvent, isExtra: boolean) {
		if (!hasPlayerPayload(event)) return;
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
		if (isExtra) extraOver = true;
		else baseOver = true;
	}

	function ondragleave(event: DragEvent, isExtra: boolean) {
		const target = event.currentTarget;
		const related = event.relatedTarget;
		if (target instanceof Node && related instanceof Node && target.contains(related)) return;
		if (isExtra) extraOver = false;
		else baseOver = false;
	}

	function ondrop(event: DragEvent, isExtra: boolean) {
		if (isExtra) extraOver = false;
		else baseOver = false;
		const playerId = readPlayerId(event);
		if (!playerId) return;
		event.preventDefault();
		event.stopPropagation();
		simulator.setProductionExtra(kingdomId, resource, playerId, isExtra);
	}
</script>

{#if kingdom}
	<div class={styles.productionStep}>
		<div class={styles.header}>
			<InlineSvg class={styles.icon} src="resources/{resource}.svg" aria-hidden="true" />
			<span class={styles.title}>Producció de {getResource(resource).title.toLowerCase()}</span>
			<span class={styles.progress}>
				({assignedTotal} / {total})
			</span>
			<span class={styles.kingdom}>{kingdom.name}</span>
		</div>

		<div class={styles.responsible}>
			<span>Reparteix:</span>
			{#if responsible}
				<PlayerChip {simulator} player={responsible} draggable={false} />
			{:else}
				<span>Cap càrrec assignat</span>
			{/if}
			{#if !isFavour && responsible}
				<label class={styles.privilege}>
					<input
						class={styles.checkbox}
						type="checkbox"
						checked={privilege}
						onchange={togglePrivilege}
					/>
					<span>Es queda 1 unitat</span>
				</label>
			{/if}
		</div>

		{#if isFavour}
			<ol class={styles.rows}>
				{#each favourRecipients as row (row.member.id)}
					<li class={styles.row}>
						<PlayerChip {simulator} player={row.member} draggable={false} large />
						<Counter
							compact
							value={row.assigned}
							min={0}
							max={total}
							label={`${getResource(resource).title} de ${row.member.name}`}
							onchange={(value) => setAssigned(row.member, value)}
						/>
					</li>
				{/each}
			</ol>
		{:else}
			<div class={styles.columns}>
				<div
					class={cx(styles.column, baseOver && styles.columnOver)}
					role="group"
					aria-label="Base de la producció"
					ondragover={(event) => ondragover(event, false)}
					ondragleave={(event) => ondragleave(event, false)}
					ondrop={(event) => ondrop(event, false)}
				>
					<div class={styles.columnHeader}>
						<span class={styles.columnLabel}>Base</span>
						<ResourceDisplay class={styles.columnIndicator} {resource} amount={base} />
					</div>
					<ol class={styles.columnList}>
						{#each rows as row (row.member.id)}
							{#if !row.inExtras}
								<li>
									<PlayerChip
										{simulator}
										player={row.member}
										draggable={true}
										large
										dragHint="Arrossega per canviar la columna"
									/>
								</li>
							{/if}
						{/each}
					</ol>
				</div>

				{#if extra > 0}
					<div
						class={cx(styles.column, extraOver && styles.columnOver)}
						role="group"
						aria-label="Extra de la producció"
						ondragover={(event) => ondragover(event, true)}
						ondragleave={(event) => ondragleave(event, true)}
						ondrop={(event) => ondrop(event, true)}
					>
						<div class={styles.columnHeader}>
							<span class={styles.columnLabel}>Extra</span>
							<ResourceDisplay class={styles.columnIndicator} {resource} amount={base + 1} />
							<span class={styles.columnCount}>{extras.length}/{extra}</span>
						</div>
						<ol class={styles.columnList}>
							{#each rows as row (row.member.id)}
								{#if row.inExtras}
									<li>
										<PlayerChip
											{simulator}
											player={row.member}
											draggable={true}
											large
											dragHint="Arrossega per canviar la columna"
										/>
									</li>
								{/if}
							{/each}
						</ol>
					</div>
				{/if}
			</div>
		{/if}

		<div class={styles.actions}>
			<IconButton
				src="ui/reset.svg"
				class={!canReset ? styles.disabled : undefined}
				disabled={!canReset}
				label="Reinicia el repartiment"
				onclick={() => simulator.resetProductionStep(kingdomId, resource)}
			/>
			<Button disabled={!canApply} onclick={distributeAndNext}>Repartir</Button>
		</div>
	</div>
{/if}
