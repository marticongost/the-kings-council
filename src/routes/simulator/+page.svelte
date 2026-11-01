<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		page: {
			...css.column('lg')
		},
		headerActions: {
			marginLeft: 'auto',
			...css.row('xs')
		},
		panels: {
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'flex-start',
			gap: css.spacing.md,
			overflowX: 'auto',
			paddingBottom: css.spacing.sm
		},
		panelColumn: {
			// Panels keep their usual width, but grow horizontally when a player group
			// needs more than one column.
			flex: '0 0 auto',
			width: 'min-content',
			minWidth: 'min(35em, 92vw)'
		},
		tableZones: {
			...css.column('sm')
		},
		decks: {
			display: 'grid',
			gridTemplateColumns: 'repeat(auto-fit, minmax(15em, max-content))',
			justifyContent: 'center',
			gap: css.spacing.md
		},
		decksBar: {
			position: 'fixed',
			right: 0,
			bottom: 0,
			left: 0,
			zIndex: 100,
			padding: css.spacing.md,
			backgroundColor: css.palette.carrara,
			boxShadow: '0 -0.25em 1em rgba(0, 0, 0, 0.25)',
			transform: 'translateY(100%)',
			opacity: 0,
			visibility: 'hidden',
			pointerEvents: 'none',
			transition: 'transform 0.2s ease-out, opacity 0.2s ease-out, visibility 0.2s'
		},
		decksBarVisible: {
			transform: 'translateY(0)',
			opacity: 1,
			visibility: 'visible',
			pointerEvents: 'auto'
		},
		decksHint: {
			position: 'fixed',
			bottom: 0,
			left: '50%',
			zIndex: 90,
			...css.row('xs'),
			padding: `${css.spacing.xs} ${css.spacing.md}`,
			border: `1px solid ${css.palette.gurkha}`,
			borderBottom: 'none',
			borderTopLeftRadius: css.spacing.sm,
			borderTopRightRadius: css.spacing.sm,
			backgroundColor: css.palette.carrara,
			color: css.palette.wood,
			fontFamily: css.fonts.heading,
			fontSize: '0.85em',
			fontWeight: 900,
			pointerEvents: 'none',
			transform: 'translateX(-50%)',
			transition: 'opacity 0.2s ease-out'
		},
		decksHintHidden: {
			opacity: 0
		}
	});
</script>

<script lang="ts">
	import { cx } from '@emotion/css';
	import { onMount } from 'svelte';
	import IconButton from '#lib/components/IconButton.svelte';
	import InlineSvg from '#lib/components/InlineSvg.svelte';
	import Panel from '#lib/components/Panel.svelte';
	import CardZone from './CardZone.svelte';
	import DeckZone from './DeckZone.svelte';
	import IndependentPlayersPanel from './IndependentPlayersPanel.svelte';
	import KeyboardCues from './KeyboardCues.svelte';
	import KingdomPanel from './KingdomPanel.svelte';
	import { KeyboardController } from './keyboard.svelte';
	import PlanModal from './PlanModal.svelte';
	import { PlanController, providePlans } from './plans.svelte';
	import { provideTurnResolution, TurnResolution } from './resolution.svelte';
	import { provideSelection, SimulatorSelection } from './selection.svelte';
	import { SimulatorState } from './simulatorstate.svelte';
	import TurnOrderList from './TurnOrderList.svelte';
	import { deckIdsInPlay } from './types';

	/** Distance from the bottom of the viewport, in pixels, that reveals the decks. */
	const decksRevealDistance = 30;

	const simulator = new SimulatorState();
	const selection = new SimulatorSelection();
	const plans = new PlanController();
	const resolution = new TurnResolution(simulator);
	const keyboard = new KeyboardController(simulator, selection, plans, resolution);

	provideSelection(selection);
	providePlans(plans);
	provideTurnResolution(resolution);

	let decksElement = $state<HTMLElement>();
	let decksVisible = $state(false);

	/**
	 * Reveals the decks once the pointer is close to the bottom of the viewport, and keeps them
	 * revealed while it is over the (taller) panel, so that dragging cards into a deck works.
	 */
	function updateDecksVisibility(event: MouseEvent | DragEvent) {
		const panelTop = decksElement?.getBoundingClientRect().top ?? window.innerHeight;
		decksVisible = event.clientY >= Math.min(panelTop, window.innerHeight - decksRevealDistance);
	}

	function hideDecks() {
		decksVisible = false;
	}

	onMount(() => {
		simulator.load();

		window.addEventListener('mousemove', updateDecksVisibility);
		window.addEventListener('dragover', updateDecksVisibility);
		document.addEventListener('mouseleave', hideDecks);

		return () => {
			window.removeEventListener('mousemove', updateDecksVisibility);
			window.removeEventListener('dragover', updateDecksVisibility);
			document.removeEventListener('mouseleave', hideDecks);
		};
	});

	$effect(() => {
		simulator.persist();
	});

	$effect(() => {
		selection.prune(simulator);
	});

	$effect(() => {
		plans.prune(simulator);
	});

	function onBackgroundClick(event: MouseEvent) {
		const target = event.target;
		if (!(target instanceof Element)) {
			selection.clear();
			return;
		}
		if (target.closest('button, a, input, select, textarea')) return;
		if (
			target.closest('[data-simulator-kingdom], [data-simulator-player], [data-simulator-card]')
		) {
			return;
		}
		selection.clear();
	}

	function backgroundSelection(node: HTMLElement) {
		const handler = (event: MouseEvent) => onBackgroundClick(event);
		node.addEventListener('click', handler);
		return {
			destroy() {
				node.removeEventListener('click', handler);
			}
		};
	}

	function clearSimulator() {
		if (window.confirm('Segur que vols netejar el simulador? Es perdrà tot l’estat desat.')) {
			simulator.clear();
		}
	}
</script>

<svelte:head>
	<title>Simulador · El Consell del Rei</title>
</svelte:head>

<svelte:window onkeydown={keyboard.handleKeyDown} />

{#if !simulator.ready}
	<p>Carregant el simulador…</p>
{:else}
	<div class={styles.page} use:backgroundSelection>
		<div class={styles.panels}>
			<div class={styles.panelColumn}>
				<Panel title="Partida">
					{#snippet header()}
						<div class={styles.headerActions}>
							<IconButton
								src="ui/add-kingdom.svg"
								label="Afegeix regne"
								onclick={() => simulator.addKingdom()}
							/>
							<IconButton src="ui/reset.svg" label="Neteja" onclick={clearSimulator} />
						</div>
					{/snippet}

					<div class={styles.tableZones}>
						<TurnOrderList {simulator} />
						<CardZone
							{simulator}
							cards={simulator.laws}
							zone={{ kind: 'laws' }}
							label="Lleis disponibles"
							emptyLabel="No hi ha lleis disponibles"
						/>
						<CardZone
							{simulator}
							cards={simulator.market}
							zone={{ kind: 'market' }}
							label="Mercat d'actius"
							emptyLabel="Cap actiu al mercat"
							columns={3}
						>
							{#snippet actions()}
								<IconButton
									src="ui/refill.svg"
									label="Reomple el mercat"
									onclick={() => simulator.refillMarket()}
								/>
							{/snippet}
						</CardZone>
					</div>
				</Panel>
			</div>

			<div class={styles.panelColumn}>
				<IndependentPlayersPanel {simulator} />
			</div>

			{#each simulator.kingdoms as kingdom (kingdom.id)}
				<div class={styles.panelColumn}>
					<KingdomPanel {simulator} {kingdom} />
				</div>
			{/each}
		</div>

		<div class={cx(styles.decksHint, decksVisible && styles.decksHintHidden)} aria-hidden="true">
			<InlineSvg src="ui/cards.svg" />
			<span>Baralles</span>
		</div>

		<div
			class={cx(styles.decksBar, decksVisible && styles.decksBarVisible)}
			role="region"
			aria-label="Baralles"
			bind:this={decksElement}
		>
			<div class={styles.decks}>
				{#each deckIdsInPlay as deckId (deckId)}
					<DeckZone {simulator} {deckId} />
				{/each}
			</div>
		</div>

		<KeyboardCues controller={keyboard} hidden={decksVisible} />
	</div>

	<PlanModal {simulator} />
{/if}
