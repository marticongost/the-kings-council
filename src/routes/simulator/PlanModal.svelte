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
		indications: {
			...css.row(),
			gap: css.spacing.xl
		},
		indication: {
			...css.row('md'),
			alignItems: 'center'
		},
		indicationLabel: {
			fontFamily: css.fonts.heading,
			fontSize: '0.9em',
			color: css.palette.wood,
			flexShrink: 0
		},
		indicationIcon: {
			height: '1.3em',
			width: 'auto',
			color: css.palette.dawn,
			flexShrink: 0
		},
		select: {
			flex: '1 1 auto',
			minWidth: 0,
			height: css.forms.controlHeight,
			boxSizing: 'border-box',
			margin: 0,
			padding: '0 0.5em',
			border: css.forms.controlBorder,
			borderRadius: '0.3em',
			backgroundColor: css.forms.controlBackgroundColor,
			color: 'inherit',
			font: 'inherit',
			fontVariantNumeric: 'lining-nums',
			cursor: 'pointer'
		}
	});
</script>

<script lang="ts">
	import IconButton from '#lib/components/IconButton.svelte';
	import InlineSvg from '#lib/components/InlineSvg.svelte';
	import Panel from '#lib/components/Panel.svelte';
	import { provideCapabilityInputs, type CapabilityInputs } from '#lib/components/capabilityinputs';
	import CapabilityPlanner from './CapabilityPlanner.svelte';
	import Counter from './Counter.svelte';
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

	/** Cards available in the assets market, without repeating cards of the same catalog entry. */
	const marketCards = $derived(
		simulator.market.flatMap((ref) => {
			const card = simulator.cardOf(ref);
			return card ? [card] : [];
		})
	);
	const uniqueMarketCards = $derived(
		marketCards.filter(
			(card, index) => marketCards.findIndex((candidate) => candidate.id === card.id) === index
		)
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
							src="ui/reset.svg"
							label="Reinicia el pla"
							onclick={() => simulator.resetPlan(player.id)}
						/>
						<IconButton src="ui/confirm.svg" label="Confirma el pla" onclick={confirm} />
						<IconButton src="ui/close.svg" label="Tanca el pla" onclick={() => plans.close()} />
					</div>
				{/snippet}

				<div class={styles.lists}>
					<PanelSection title="Indicacions" ariaLabel="Indicacions">
						<div class={styles.indications}>
							<div class={styles.indication}>
								<span class={styles.indicationLabel}>Vigilància</span>
								<Counter
									compact
									value={player.vigilance}
									label="Vigilància"
									min={0}
									onchange={(value) => simulator.setVigilance(player.id, value)}
								>
									{#snippet icon()}
										<InlineSvg class={styles.indicationIcon} src="resources/intrigue.svg" />
									{/snippet}
								</Counter>
							</div>

							{#each player.acquisitions as acquisition, index (index)}
								<div class={styles.indication}>
									<span class={styles.indicationLabel}>Adquisició {index + 1}</span>
									<select
										class={styles.select}
										aria-label={`Carta adquirida ${index + 1}`}
										value={acquisition.cardId ?? ''}
										onchange={(event) =>
											simulator.setAcquisition(player.id, index, {
												cardId: event.currentTarget.value || null
											})}
									>
										<option value="">—</option>
										{#each uniqueMarketCards as card (card.id)}
											<option value={card.id}>{card.title}</option>
										{/each}
									</select>
									<Counter
										compact
										value={acquisition.gold}
										label={`Or pagat per l'adquisició ${index + 1}`}
										min={0}
										onchange={(value) =>
											simulator.setAcquisition(player.id, index, { gold: value })}
									>
										{#snippet icon()}
											<InlineSvg class={styles.indicationIcon} src="resources/gold.svg" />
										{/snippet}
									</Counter>
								</div>
							{/each}
						</div>
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
