<script lang="ts" module>
	import * as css from '#lib/styles';

	/** Grid columns of a vote row: player, power, favour and vote side. */
	const voteColumns = 'minmax(0, 1fr) auto auto auto';

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
			width: 'min(55em, 96vw)',
			maxHeight: '90vh',
			overflow: 'auto',
			outline: 'none'
		},
		headerActions: {
			marginLeft: 'auto'
		},
		body: {
			...css.column('md'),
			minWidth: 0
		},
		columns: {
			...css.row('lg'),
			alignItems: 'flex-start',
			minWidth: 0
		},
		law: {
			...css.column('sm'),
			alignItems: 'center',
			flexShrink: 0
		},
		lawPicker: {
			...css.row('sm'),
			alignItems: 'center',
			justifyContent: 'center',
			minWidth: 0
		},
		lawArrow: {
			fontSize: '1.8rem',
			flexShrink: 0
		},
		lawCard: {
			flexShrink: 0,
			width: `${css.cards.standard.width}mm`,
			height: `${css.cards.standard.height}mm`,
			borderRadius: '1mm',
			overflow: 'hidden',
			boxShadow: `0 0 0 0.2mm ${css.palette.gurkha}, 0 1mm 3mm rgba(0, 0, 0, 0.35)`
		},
		lawCounter: {
			margin: 0,
			fontFamily: css.fonts.number,
			fontWeight: 900,
			fontSize: '0.85em',
			color: css.palette.wood,
			textAlign: 'center'
		},
		hint: {
			margin: 0,
			fontSize: '0.85em',
			fontStyle: 'italic',
			color: css.text.subtleColor
		},
		votes: {
			...css.column('sm'),
			flex: '1 1 auto',
			minWidth: 0
		},
		row: {
			display: 'grid',
			gridTemplateColumns: voteColumns,
			alignItems: 'center',
			gap: css.spacing.md,
			padding: `0 ${css.spacing.md}`,
			minWidth: 0
		},
		counterCell: {
			justifySelf: 'end',
			minWidth: 0
		},
		resourceIcon: {
			height: '1em',
			width: 'auto',
			flexShrink: 0,
			color: css.palette.dawn
		},
		sideToggle: {
			...css.row(),
			justifySelf: 'end'
		},
		sideButton: {
			padding: `${css.spacing.sm} ${css.spacing.md}`,
			border: 'none',
			backgroundColor: 'transparent',
			color: css.palette.wood,
			fontFamily: css.fonts.text,
			fontSize: '0.85em',
			cursor: 'pointer',
			...css.focus.mixin,
			'&:hover': {
				color: css.palette.tobacco
			}
		},
		sideFor: {
			color: css.palette.green,
			fontWeight: 900
		},
		sideAgainst: {
			color: css.palette.buccaneer,
			fontWeight: 900
		},
		tallyRow: {
			...css.row('md'),
			justifyContent: 'center',
			flexWrap: 'wrap'
		},
		tally: {
			...css.column('xs'),
			alignItems: 'center',
			minWidth: '8em',
			padding: css.spacing.sm,
			border: css.forms.controlBorder,
			borderRadius: css.spacing.sm,
			backgroundColor: css.palette.carrara,
			color: css.palette.wood
		},
		tallyFor: {
			borderColor: css.palette.green,
			backgroundColor: css.palette.willow,
			color: css.palette.green
		},
		tallyAgainst: {
			borderColor: css.palette.buccaneer,
			backgroundColor: css.palette.blush,
			color: css.palette.buccaneer
		},
		tallyLabel: {
			fontFamily: css.fonts.heading,
			fontSize: '0.85em'
		},
		tallyValue: {
			fontFamily: css.fonts.number,
			fontWeight: 900,
			fontSize: '2em',
			lineHeight: 1
		},
		actions: {
			...css.row('sm'),
			justifyContent: 'flex-end'
		}
	});
</script>

<script lang="ts">
	import { cx } from '@emotion/css';
	import Button from '#lib/components/Button.svelte';
	import CardFront from '#lib/components/CardFront.svelte';
	import IconButton from '#lib/components/IconButton.svelte';
	import InlineSvg from '#lib/components/InlineSvg.svelte';
	import Panel from '#lib/components/Panel.svelte';
	import Counter from './Counter.svelte';
	import PlayerChip from './PlayerChip.svelte';
	import type { SimulatorState } from './simulatorstate.svelte';
	import { useVotes } from './votes.svelte';

	interface Props {
		simulator: SimulatorState;
	}

	const { simulator }: Props = $props();

	const votes = useVotes();
	const kingdom = $derived(
		simulator.kingdoms.find((candidate) => candidate.id === votes.kingdomId) ?? null
	);
	const members = $derived(votes.kingdomId ? simulator.membersOf(votes.kingdomId) : []);
	const laws = $derived(
		simulator.laws.flatMap((ref) => {
			const card = simulator.cardOf(ref);
			return card ? [{ uid: ref.uid, card }] : [];
		})
	);
	const lawIndex = $derived(laws.findIndex((law) => law.uid === votes.lawUid));
	const selectedLaw = $derived(lawIndex >= 0 ? laws[lawIndex] : null);
	const totals = $derived(votes.totals);
	const winner = $derived(
		totals.for > totals.against ? 'for' : totals.against > totals.for ? 'against' : null
	);
	const canFinish = $derived(votes.lawUid !== null && members.length > 0);

	/** Steps the law selection by `delta` laws, wrapping around both ends. */
	function stepLaw(delta: number) {
		if (laws.length === 0) return;
		const index = lawIndex >= 0 ? lawIndex : 0;
		const next = (index + delta + laws.length) % laws.length;
		votes.selectLaw(laws[next].uid);
	}

	let dialog = $state<HTMLDivElement>();

	$effect(() => {
		dialog?.focus();
	});

	// The modal captures the keyboard, so Escape is handled by a direct listener: delegated
	// `svelte:window` key handlers may be skipped once another handler has the event.
	$effect(() => {
		if (!kingdom) return;

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') return;
			event.preventDefault();
			event.stopPropagation();
			votes.close();
		};

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	});

	function closeOnBackdrop(event: MouseEvent) {
		if (event.target === event.currentTarget) votes.close();
	}
</script>

{#if kingdom}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class={styles.overlay} role="presentation" onclick={closeOnBackdrop}>
		<div
			class={styles.dialog}
			role="dialog"
			aria-modal="true"
			aria-label={`Votació de ${kingdom.name}`}
			tabindex="-1"
			bind:this={dialog}
			onclick={(event) => event.stopPropagation()}
		>
			<Panel title={`Votació de ${kingdom.name}`}>
				{#snippet header()}
					<div class={styles.headerActions}>
						<IconButton src="ui/close.svg" label="Tanca la votació" onclick={() => votes.close()} />
					</div>
				{/snippet}

				<div class={styles.body}>
					<div class={styles.columns}>
						<div class={styles.law}>
							<div class={styles.lawPicker}>
								<IconButton
									class={styles.lawArrow}
									src="ui/previous.svg"
									label="Llei anterior"
									disabled={laws.length <= 1}
									onclick={() => stepLaw(-1)}
								/>
								{#if selectedLaw}
									<div class={styles.lawCard}>
										<CardFront card={selectedLaw.card} />
									</div>
								{:else}
									<p class={styles.hint}>No hi ha cap llei a la fila.</p>
								{/if}
								<IconButton
									class={styles.lawArrow}
									src="ui/next.svg"
									label="Llei següent"
									disabled={laws.length <= 1}
									onclick={() => stepLaw(1)}
								/>
							</div>
							{#if laws.length > 0}
								<p class={styles.lawCounter}>
									{lawIndex >= 0 ? lawIndex + 1 : 1} de {laws.length}
								</p>
							{/if}
						</div>

						<div class={styles.votes}>
							{#if members.length > 0}
								{#each members as player (player.id)}
									{@const allocation = votes.allocationOf(player.id)}
									<div class={styles.row}>
										<PlayerChip {simulator} {player} draggable={false} />
										<div class={styles.counterCell}>
											<Counter
												compact
												value={allocation.power}
												label={`Poder de ${player.name}`}
												max={player.resources.power}
												onchange={(value) => votes.setPower(player.id, value)}
											>
												{#snippet icon()}
													<InlineSvg class={styles.resourceIcon} src="resources/power.svg" />
												{/snippet}
											</Counter>
										</div>
										<div class={styles.counterCell}>
											<Counter
												compact
												value={allocation.favour}
												label={`Favor de ${player.name}`}
												max={player.resources.favour}
												onchange={(value) => votes.setFavour(player.id, value)}
											>
												{#snippet icon()}
													<InlineSvg class={styles.resourceIcon} src="resources/favour.svg" />
												{/snippet}
											</Counter>
										</div>
										<div
											class={styles.sideToggle}
											role="group"
											aria-label={`Vot de ${player.name}`}
										>
											<button
												type="button"
												class={cx(styles.sideButton, allocation.side === 'for' && styles.sideFor)}
												aria-pressed={allocation.side === 'for'}
												onclick={() => votes.setSide(player.id, 'for')}
											>
												A favor
											</button>
											<button
												type="button"
												class={cx(
													styles.sideButton,
													allocation.side === 'against' && styles.sideAgainst
												)}
												aria-pressed={allocation.side === 'against'}
												onclick={() => votes.setSide(player.id, 'against')}
											>
												En contra
											</button>
										</div>
									</div>
								{/each}
							{:else}
								<p class={styles.hint}>Aquest regne no té jugadors.</p>
							{/if}

							<div class={styles.tallyRow} aria-live="polite">
								<div class={cx(styles.tally, winner === 'for' && styles.tallyFor)}>
									<span class={styles.tallyLabel}>A favor</span>
									<span class={styles.tallyValue}>{totals.for}</span>
								</div>
								<div class={cx(styles.tally, winner === 'against' && styles.tallyAgainst)}>
									<span class={styles.tallyLabel}>En contra</span>
									<span class={styles.tallyValue}>{totals.against}</span>
								</div>
							</div>

							<div class={styles.actions}>
								<Button disabled={!canFinish} onclick={() => votes.finish()}>Finalitzar</Button>
							</div>
						</div>
					</div>
				</div>
			</Panel>
		</div>
	</div>
{/if}
