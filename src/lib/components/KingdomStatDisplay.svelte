<script lang="ts" module>
	import type { KingdomStatType } from '#lib/models/kingdomstats';
	import * as css from '#lib/styles';
	import KingdomStatIcon from './KingdomStatIcon.svelte';

	const styles = css.styles({
		kingdomStatDisplay: {},
		icon: {},
		amount: {}
	});
</script>

<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from './utils';

	interface Props extends StandardAttributeProps {
		stat: KingdomStatType;
		amount?: number;
	}

	const { stat, amount = 0, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, styles.kingdomStatDisplay)}>
	<KingdomStatIcon class={styles.icon} {stat} />
	{#if amount}
		<span class={styles.amount}>
			{#if amount > 0}+{/if}
			{amount}
		</span>
	{/if}
</span>
