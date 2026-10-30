<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		headerActions: {
			marginLeft: 'auto'
		}
	});
</script>

<script lang="ts">
	import IconButton from '#lib/components/IconButton.svelte';
	import Panel from '#lib/components/Panel.svelte';
	import PlayerGroup from './PlayerGroup.svelte';
	import { playerDropHandlers } from './playerDrop';
	import type { SimulatorState } from './simulatorstate.svelte';

	interface Props {
		simulator: SimulatorState;
	}

	const { simulator }: Props = $props();

	const independents = $derived(simulator.independentPlayers());

	let isOver = $state(false);

	const drop = playerDropHandlers({
		simulator: () => simulator,
		kingdomId: () => null,
		onOverChange: (value) => (isOver = value)
	});
</script>

<Panel
	title="Jugadors independents"
	{isOver}
	ondragover={drop.ondragover}
	ondragleave={drop.ondragleave}
	ondrop={drop.ondrop}
>
	{#snippet header()}
		<div class={styles.headerActions}>
			<IconButton
				src="ui/add-player.svg"
				label="Afegeix jugador sense regne"
				onclick={() => simulator.addPlayer()}
			/>
		</div>
	{/snippet}

	<PlayerGroup {simulator} players={independents} emptyLabel="Cap jugador sense regne" />
</Panel>
