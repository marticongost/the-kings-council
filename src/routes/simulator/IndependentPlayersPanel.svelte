<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		headerActions: {
			marginLeft: 'auto'
		},
		selected: {
			outline: `2px solid ${css.palette.cedar}88`,
			outlineOffset: '-2px'
		}
	});
</script>

<script lang="ts">
	import IconButton from '#lib/components/IconButton.svelte';
	import Panel from '#lib/components/Panel.svelte';
	import PlayerGroup from './PlayerGroup.svelte';
	import { playerDropHandlers } from './playerDrop';
	import { useSelection } from './selection.svelte';
	import type { SimulatorState } from './simulatorstate.svelte';
	import { independentKingdomId } from './types';

	interface Props {
		simulator: SimulatorState;
	}

	const { simulator }: Props = $props();

	const selection = useSelection();
	const selected = $derived(selection.kingdoms.has(independentKingdomId));
	const independents = $derived(simulator.independentPlayers());

	function onclick(event: MouseEvent) {
		event.stopPropagation();
		if (
			event.target instanceof Element &&
			event.target.closest('button, a, input, select, textarea')
		) {
			return;
		}
		selection.select('kingdom', independentKingdomId, event.ctrlKey || event.metaKey);
	}

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
	class={selected ? styles.selected : undefined}
	data-simulator-kingdom={independentKingdomId}
	aria-current={selected ? 'true' : undefined}
	{onclick}
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
