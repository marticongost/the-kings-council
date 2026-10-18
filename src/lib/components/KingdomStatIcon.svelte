<script lang="ts" module>
	import type { KingdomStatType } from '#lib/models/kingdomstats';
	import * as css from '#lib/styles';
	import InlineSvg from './InlineSvg.svelte';

	const styles = css.styles({
		kingdomStatIcon: {
			height: '1.2em',
			backgroundColor: css.palette.wood,
			color: css.palette.white,
			padding: '0.2em',
			borderRadius: '0.4em'
		}
	});
</script>

<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from './utils';

	interface Props extends StandardAttributeProps {
		stat: KingdomStatType;
	}

	const { stat, ...attributes }: Props = $props();
</script>

<InlineSvg
	{...standardAttributes(attributes, styles.kingdomStatIcon)}
	src="kingdom-stats/{stat}.svg"
/>
