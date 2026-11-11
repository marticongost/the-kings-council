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
		resetAnchor: {
			position: 'relative',
			display: 'flex'
		},
		resetMenu: {
			position: 'absolute',
			top: '100%',
			right: 0,
			zIndex: 20,
			display: 'flex',
			flexDirection: 'column',
			gap: css.spacing.xs,
			marginTop: '0.2em',
			padding: css.spacing.sm,
			border: css.forms.controlBorder,
			borderRadius: '0.3em',
			backgroundColor: css.forms.controlBackgroundColor,
			boxShadow: '0 0.2em 0.5em rgba(0, 0, 0, 0.25)'
		},
		resetMenuTitle: {
			fontFamily: css.fonts.heading,
			fontWeight: 900,
			fontSize: '0.9em',
			color: css.palette.wood,
			whiteSpace: 'nowrap'
		},
		resetMenuGrid: {
			display: 'grid',
			gridTemplateColumns: 'repeat(4, 2.2em)',
			gap: css.spacing.xs
		},
		resetMenuOption: {
			height: '2.2em',
			border: css.forms.controlBorder,
			borderRadius: '0.2em',
			backgroundColor: css.palette.carrara,
			color: css.palette.wood,
			fontFamily: css.fonts.number,
			fontSize: '0.9em',
			cursor: 'pointer',
			'&:hover': {
				backgroundColor: css.palette.ivory
			},
			'&:focus-visible': {
				outline: css.focus.outline
			}
		},
		disabledButton: {
			opacity: 0.35
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
		turn: {
			...css.row('md')
		},
		turnLabel: {
			fontFamily: css.fonts.heading,
			fontWeight: 900,
			color: css.palette.wood
		},
		danger: {
			...css.row('xs'),
			color: css.palette.wood
		},
		dangerIcon: {
			height: '1.1em',
			width: 'auto',
			color: css.palette.crisis
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
	import { onMount, tick } from 'svelte';
	import IconButton from '#lib/components/IconButton.svelte';
	import InlineSvg from '#lib/components/InlineSvg.svelte';
	import Panel from '#lib/components/Panel.svelte';
	import CardZone from './CardZone.svelte';
	import Counter from './Counter.svelte';
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
	import { deckIdsInPlay, maxPlayers, maxTurn, minPlayers, minTurn } from './types';
	import VoteModal from './VoteModal.svelte';
	import { provideVotes, VoteController } from './votes.svelte';

	/** Distance from the bottom of the viewport, in pixels, that reveals the decks. */
	const decksRevealDistance = 30;

	/** The player counts a new game can be started with, one box per count. */
	const playerCounts = Array.from(
		{ length: maxPlayers - minPlayers + 1 },
		(_, index) => minPlayers + index
	);

	const simulator = new SimulatorState();
	/** One skull per point of danger, so danger 3 renders as three skulls. */
	const dangerSkulls = $derived(Array.from({ length: simulator.danger }));
	const selection = new SimulatorSelection();
	const plans = new PlanController(simulator);
	const votes = new VoteController(simulator);
	const resolution = new TurnResolution(simulator);
	const keyboard = new KeyboardController(simulator, selection, plans, resolution, votes);

	provideSelection(selection);
	providePlans(plans);
	provideVotes(votes);
	provideTurnResolution(resolution);

	let decksElement = $state<HTMLElement>();
	let decksVisible = $state(false);

	let resetMenuOpen = $state(false);
	let resetMenuAnchor = $state<HTMLElement>();
	let resetMenu = $state<HTMLDivElement>();

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

	$effect(() => {
		votes.prune(simulator);
	});

	// The new game menu closes when the pointer goes elsewhere, and Escape closes it without
	// reaching the simulator keyboard shortcuts.
	$effect(() => {
		if (!resetMenuOpen) return;

		const closeOnOutside = (event: PointerEvent) => {
			if (
				resetMenuAnchor &&
				event.target instanceof Node &&
				resetMenuAnchor.contains(event.target)
			) {
				return;
			}
			resetMenuOpen = false;
		};
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') return;
			event.preventDefault();
			event.stopPropagation();
			resetMenuOpen = false;
		};

		document.addEventListener('pointerdown', closeOnOutside);
		document.addEventListener('keydown', closeOnEscape, true);
		return () => {
			document.removeEventListener('pointerdown', closeOnOutside);
			document.removeEventListener('keydown', closeOnEscape, true);
		};
	});

	$effect(() => {
		if (!resetMenuOpen) return;
		void tick().then(() => resetMenu?.querySelector('button')?.focus());
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

	function startNewGame(playerCount: number) {
		simulator.newGame(playerCount);
		resetMenuOpen = false;
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
								src="ui/undo.svg"
								class={cx(!simulator.canUndo && styles.disabledButton)}
								disabled={!simulator.canUndo}
								label={simulator.undoDescription
									? `Desfés: ${simulator.undoDescription}`
									: 'Desfés'}
								onclick={() => simulator.undo()}
							/>
							<IconButton
								src="ui/redo.svg"
								class={cx(!simulator.canRedo && styles.disabledButton)}
								disabled={!simulator.canRedo}
								label={simulator.redoDescription ? `Refés: ${simulator.redoDescription}` : 'Refés'}
								onclick={() => simulator.redo()}
							/>
							<IconButton
								src="ui/add-kingdom.svg"
								label="Afegeix regne"
								onclick={() => simulator.addKingdom()}
							/>
							<div class={styles.resetAnchor} bind:this={resetMenuAnchor}>
								<IconButton
									src="ui/reset.svg"
									label="Nova partida"
									aria-haspopup="true"
									aria-expanded={resetMenuOpen}
									onclick={() => (resetMenuOpen = !resetMenuOpen)}
								/>
								{#if resetMenuOpen}
									<div
										class={styles.resetMenu}
										role="group"
										aria-label="Nova partida"
										bind:this={resetMenu}
									>
										<span class={styles.resetMenuTitle}>Jugadors</span>
										<div class={styles.resetMenuGrid}>
											{#each playerCounts as count (count)}
												<button
													type="button"
													class={styles.resetMenuOption}
													aria-label={`Nova partida de ${count} jugadors`}
													onclick={() => startNewGame(count)}
												>
													{count}
												</button>
											{/each}
										</div>
									</div>
								{/if}
							</div>
						</div>
					{/snippet}

					<div class={styles.tableZones}>
						<div class={styles.turn}>
							<Counter
								compact
								value={simulator.turn}
								label="Torn"
								min={minTurn}
								max={maxTurn}
								onchange={(value) => simulator.setTurn(value)}
							>
								{#snippet icon()}
									<span class={styles.turnLabel}>Torn</span>
								{/snippet}
							</Counter>
							<span
								class={styles.danger}
								title="Perill"
								role="img"
								aria-label={`Perill ${simulator.danger}`}
							>
								{#each dangerSkulls as _, index (index)}
									<InlineSvg
										class={styles.dangerIcon}
										src="keywords/danger.svg"
										aria-hidden="true"
									/>
								{/each}
							</span>
						</div>
						<TurnOrderList {simulator} />
						<CardZone
							{simulator}
							cards={simulator.laws}
							zone={{ kind: 'laws' }}
							label="Lleis disponibles"
							emptyLabel="No hi ha lleis disponibles"
							columns={3}
						>
							{#snippet actions()}
								<IconButton
									src="ui/refill.svg"
									label="Reomple les lleis"
									onclick={() => simulator.refillLaws()}
								/>
							{/snippet}
						</CardZone>
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
	<VoteModal {simulator} />
{/if}
