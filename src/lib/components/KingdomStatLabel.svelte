<script lang="ts" module>
	import { getKingdomStat, type KingdomStatType } from '#lib/models/kingdomstats';
	import * as css from '#lib/styles';
	import KingdomStatIcon from './KingdomStatIcon.svelte';

	const styles = css.styles({
		kingdomStatDisplay: {},
		icon: {},
		name: {
			fontWeight: 'bold'
		}
	});
</script>

<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from './utils';

	interface Props extends StandardAttributeProps {
		stat: KingdomStatType;
		amount?: number;
	}

	const { stat, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, styles.kingdomStatDisplay)}>
	<KingdomStatIcon class={styles.icon} {stat} />
	<span class={styles.name}>
		{getKingdomStat(stat).title}
	</span>
</span>
