<script lang="ts" module>
	import { getCrisisTokenIcon } from '#lib/cardattributes';
	import type { CrisisToken } from '#lib/models/crisis-tokens';
	import * as css from '#lib/styles';
	import InlineSvg from './InlineSvg.svelte';

	const styles = css.styles({
		crisisTokenLabel: {},
		icon: {
			color: css.palette.petal
		},
		name: {
			fontWeight: 'bold'
		}
	});
</script>

<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from './utils';

	interface Props extends StandardAttributeProps {
		token: CrisisToken;
	}

	const { token, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, styles.crisisTokenLabel)}>
	<InlineSvg class={styles.icon} src={getCrisisTokenIcon(token)} />
	<span class={styles.name}>
		{token.title}
	</span>
</span>
