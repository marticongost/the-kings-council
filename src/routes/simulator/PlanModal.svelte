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
		},
		cards: {
			...css.grid('sm'),
			alignContent: 'flex-start',
			alignItems: 'flex-start'
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
	import CardCapabilityFront from '#lib/components/CardCapabilityFront.svelte';
	import IconButton from '#lib/components/IconButton.svelte';
	import Panel from '#lib/components/Panel.svelte';
	import { provideCapabilityInputs, type CapabilityInputs } from '#lib/components/capabilityinputs';
	import CapabilityPlanner from './CapabilityPlanner.svelte';
	import PanelSection from './PanelSection.svelte';
	import { usePlans } from './plans.svelte';
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
	const capabilities = $derived(player ? simulator.plannableCapabilities(player) : []);
	const actionCapabilities = $derived(
		capabilities.filter((capability) => capability.cardCapability.capability.type === 'action')
	);
	const secretCapabilities = $derived(
		capabilities.filter((capability) => capability.cardCapability.capability.type === 'secret')
	);

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
					<PanelSection
						title="Indicacions"
						ariaLabel="Indicacions"
						role="list"
						contentClass={styles.cards}
					>
						{#each plan.indications as capability (capability.key)}
							<div role="listitem">
								<CardCapabilityFront
									cardCapability={capability.cardCapability}
									editable
									inputKey={capability.key}
								/>
							</div>
						{:else}
							<p class={styles.empty}>Cap indicació</p>
						{/each}
					</PanelSection>
					<CapabilityPlanner
						{simulator}
						playerId={player.id}
						listId="actions"
						title="Accions"
						capabilities={actionCapabilities}
						planned={plan.actions}
						addLabel="Afegeix una acció"
						resetLabel="Buida les accions"
					/>
					<CapabilityPlanner
						{simulator}
						playerId={player.id}
						listId="secrets"
						title="Secrets"
						capabilities={secretCapabilities}
						planned={plan.secrets}
						addLabel="Afegeix un secret"
						resetLabel="Buida els secrets"
					/>
				</div>
			</Panel>
		</div>
	</div>
{/if}
