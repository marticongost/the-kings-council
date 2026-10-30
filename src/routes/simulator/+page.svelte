<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		page: {
			...css.column('lg')
		},
		toolbar: {
			...css.row('md'),
			justifyContent: 'space-between',
			flexWrap: 'wrap',
			alignItems: 'flex-end'
		},
		titleBlock: {
			...css.column('xs')
		},
		title: {
			margin: 0,
			fontFamily: css.fonts.heading,
			color: css.palette.cedar
		},
		hint: {
			margin: 0,
			maxWidth: '60em',
			fontSize: '0.9em',
			color: css.text.subtleColor
		},
		section: {
			...css.column('sm')
		},
		sectionHeader: {
			...css.row('sm'),
			flexWrap: 'wrap',
			justifyContent: 'space-between'
		},
		sectionTitle: {
			margin: 0,
			fontFamily: css.fonts.heading,
			fontSize: '1.3em',
			color: css.palette.cedar
		},
		panels: {
			display: 'grid',
			gridTemplateColumns: 'repeat(auto-fill, minmax(min(56em, 100%), 1fr))',
			gap: css.spacing.md,
			alignItems: 'start'
		},
		tableZones: {
			display: 'grid',
			gridTemplateColumns: 'repeat(auto-fit, minmax(18em, 1fr))',
			gap: css.spacing.md
		},
		decks: {
			display: 'grid',
			gridTemplateColumns: 'repeat(auto-fill, minmax(15em, 1fr))',
			gap: css.spacing.md
		},
		empty: {
			margin: 0,
			fontStyle: 'italic',
			color: css.text.subtleColor
		}
	});
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '#lib/components/Button.svelte';
	import CardZone from './CardZone.svelte';
	import DeckZone from './DeckZone.svelte';
	import KingdomPanel from './KingdomPanel.svelte';
	import PlayerPanel from './PlayerPanel.svelte';
	import { SimulatorState } from './simulatorstate.svelte';
	import { deckIds } from './types';

	const simulator = new SimulatorState();

	// Common action cards are reference cards whose capabilities every player has,
	// and offices belong to kingdoms rather than to a draw pile.
	const deckIdsInPlay = deckIds.filter((deckId) => deckId !== 'common' && deckId !== 'office');

	onMount(() => {
		simulator.load();
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
		<header class={styles.toolbar}>
			<div class={styles.titleBlock}>
				<h1 class={styles.title}>Simulador</h1>
				<p class={styles.hint}>
					Pista: arrossega una baralla per robar la carta superior, mou les cartes entre mans,
					descarts, la fila de lleis i el mercat d'actius, i assigna càrrecs arrossegant-los entre
					regnes i jugadors.
				</p>
			</div>
			<Button onclick={clearSimulator}>Neteja</Button>
		</header>

		<section class={styles.section}>
			<div class={styles.sectionHeader}>
				<h2 class={styles.sectionTitle}>Jugadors</h2>
				<Button onclick={() => simulator.addPlayer()}>Afegeix jugador</Button>
			</div>
			{#if simulator.players.length > 0}
				<div class={styles.panels}>
					{#each simulator.players as player (player.id)}
						<PlayerPanel {simulator} {player} />
					{/each}
				</div>
			{:else}
				<p class={styles.empty}>Encara no hi ha jugadors.</p>
			{/if}
		</section>

		<section class={styles.section}>
			<div class={styles.sectionHeader}>
				<h2 class={styles.sectionTitle}>Regnes</h2>
				<Button onclick={() => simulator.addKingdom()}>Afegeix regne</Button>
			</div>
			{#if simulator.kingdoms.length > 0}
				<div class={styles.panels}>
					{#each simulator.kingdoms as kingdom (kingdom.id)}
						<KingdomPanel {simulator} {kingdom} />
					{/each}
				</div>
			{:else}
				<p class={styles.empty}>Encara no hi ha regnes.</p>
			{/if}
		</section>

		<section class={styles.section}>
			<h2 class={styles.sectionTitle}>Taula</h2>
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
				/>
			</div>
			<div class={styles.decks}>
				{#each deckIdsInPlay as deckId (deckId)}
					<DeckZone {simulator} {deckId} />
				{/each}
			</div>
		</section>
	</div>
{/if}
