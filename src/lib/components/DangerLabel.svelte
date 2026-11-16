<script lang="ts" module>
	import * as css from '#lib/styles';
	import InlineSvg from './InlineSvg.svelte';

	const styles = css.styles({
		dangerLabel: {},
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

	type Props = StandardAttributeProps;

	const { ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, styles.dangerLabel)}>
	<InlineSvg class={styles.icon} src="keywords/danger.svg" />
	<span class={styles.name}>Perill</span>
</span>
