<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		overlay: {
			position: 'fixed',
			inset: 0,
			zIndex: 200,
			display: 'flex',
			alignItems: 'flex-start',
			justifyContent: 'center',
			padding: css.spacing.lg,
			backgroundColor: 'rgba(51, 15, 27, 0.5)',
			overflow: 'auto'
		},
		dialog: {
			width: 'min(90em, 96vw)',
			maxHeight: '90vh',
			overflow: 'auto',
			outline: 'none'
		},
		headerActions: {
			marginLeft: 'auto'
		},
		lists: {
			...css.column('lg')
		}
	});
</script>

<script lang="ts">
	import IconButton from '#lib/components/IconButton.svelte';
	import Panel from '#lib/components/Panel.svelte';
	import { provideCapabilityInputs, type CapabilityInputs } from '#lib/components/capabilityinputs';
	import { usePlans } from './plans.svelte';
	import PlanCapabilityList from './PlanCapabilityList.svelte';
	import type { SimulatorState } from './simulatorstate.svelte';

	interface Props {
		simulator: SimulatorState;
	}

	const { simulator }: Props = $props();

	const plans = usePlans();
	const player = $derived(
		simulator.players.find((candidate) => candidate.id === plans.playerId) ?? null
	);
	const plan = $derived(player ? simulator.planOf(player) : null);

	const capabilityInputs: CapabilityInputs = {
		value: (key) => (player ? simulator.planInput(player.id, key) : ''),
		setValue: (key, value) => {
			if (player) simulator.setPlanInput(player.id, key, value);
		},
		get players() {
			return simulator.players.map((candidate) => ({ value: candidate.id, label: candidate.name }));
		},
		get kingdoms() {
			return simulator.kingdoms.map((kingdom) => ({ value: kingdom.id, label: kingdom.name }));
		}
	};

	provideCapabilityInputs(capabilityInputs);

	let dialog = $state<HTMLDivElement>();

	$effect(() => {
		dialog?.focus();
	});

	// The modal captures the keyboard, so Escape is handled by a direct listener: delegated
	// `svelte:window` key handlers may be skipped once another handler has the event.
	$effect(() => {
		if (!player) return;

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') return;
			event.preventDefault();
			event.stopPropagation();
			plans.close();
		};

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	});

	function closeOnBackdrop(event: MouseEvent) {
		if (event.target === event.currentTarget) plans.close();
	}

	function confirm() {
		if (!player) return;
		simulator.confirmPlan(player.id);
		plans.close();
	}
</script>

{#if player && plan}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class={styles.overlay} role="presentation" onclick={closeOnBackdrop}>
		<div
			class={styles.dialog}
			role="dialog"
			aria-modal="true"
			aria-label={`Pla de torn de ${player.name}`}
			tabindex="-1"
			bind:this={dialog}
			onclick={(event) => event.stopPropagation()}
		>
			<Panel title={`Pla de torn de ${player.name}`}>
				{#snippet header()}
					<div class={styles.headerActions}>
						<IconButton
							src="ui/restart.svg"
							label="Reinicia el pla"
							onclick={() => simulator.resetPlan(player.id)}
						/>
						<IconButton src="ui/confirm.svg" label="Confirma el pla" onclick={confirm} />
						<IconButton src="ui/close.svg" label="Tanca el pla" onclick={() => plans.close()} />
					</div>
				{/snippet}

				<div class={styles.lists}>
					<PlanCapabilityList
						{simulator}
						playerId={player.id}
						listId="available"
						title="Capacitats disponibles"
						capabilities={plan.available}
						emptyLabel="Cap capacitat disponible"
					/>
					<PlanCapabilityList
						{simulator}
						playerId={player.id}
						listId="planned"
						title="Capacitats planificades"
						capabilities={plan.planned}
						emptyLabel="Cap capacitat planificada"
					/>
				</div>
			</Panel>
		</div>
	</div>
{/if}
