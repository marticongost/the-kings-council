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
			flex: '0 0 min(35em, 92vw)',
			minWidth: 0
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
	import KingdomPanel from './KingdomPanel.svelte';
	import { SimulatorState } from './simulatorstate.svelte';
	import { deckIds } from './types';

	/** Distance from the bottom of the viewport, in pixels, that reveals the decks. */
	const decksRevealDistance = 30;

	const simulator = new SimulatorState();

	// Common action cards are reference cards whose capabilities every player has,
	// and offices belong to kingdoms rather than to a draw pile.
	const deckIdsInPlay = deckIds.filter((deckId) => deckId !== 'common' && deckId !== 'office');

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

	function clearSimulator() {
		if (window.confirm('Segur que vols netejar el simulador? Es perdrà tot l’estat desat.')) {
			simulator.clear();
		}
	}
</script>

<svelte:head>
	<title>Simulador · El Consell del Rei</title>
</svelte:head>

{#if !simulator.ready}
	<p>Carregant el simulador…</p>
{:else}
	<div class={styles.page}>
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
							<IconButton src="ui/restart.svg" label="Neteja" onclick={clearSimulator} />
						</div>
					{/snippet}

					<div class={styles.tableZones}>
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
	</div>
{/if}
