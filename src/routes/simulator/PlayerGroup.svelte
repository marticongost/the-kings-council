<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		group: {
			...css.column('md'),
			minWidth: 0
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
	import PlayerPanel from './PlayerPanel.svelte';
	import type { SimulatorState } from './simulatorstate.svelte';
	import type { PlayerState } from './types';

	interface Props {
		simulator: SimulatorState;
		players: Array<PlayerState>;
		emptyLabel?: string;
	}

	const { simulator, players, emptyLabel = 'Sense jugadors' }: Props = $props();
</script>

{#if players.length > 0}
	<div class={styles.group}>
		{#each players as player (player.id)}
			<PlayerPanel {simulator} {player} />
		{/each}
	</div>
{:else}
	<p class={styles.empty}>{emptyLabel}</p>
{/if}
