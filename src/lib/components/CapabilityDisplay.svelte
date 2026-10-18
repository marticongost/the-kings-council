<script lang="ts" module>
	import { ConcreteCapability, type Capability } from '#lib/models/capabilities';
	import * as css from '#lib/styles';

	const variants = css.styleVariants(['regular', 'reaction']);

	const stylesFor = css.multipleStyles({
		capabilityDisplay: {
			lineHeight: '1em'
		},
		entry: {
			...css.column()
		},
		icon: {
			flexShrink: 0,
			height: '1em',
			width: 'auto',
			color: css.palette.dawn
		},
		header: {
			...css.row('xs'),
			color: css.palette.wood,
			marginBottom: '0.1em',
			paddingBottom: '0.1em',
			borderBottom: `1px solid ${css.palette.blush}`
		},
		title: {
			fontSize: '0.85em',
			fontFamily: css.fonts.heading,
			margin: 0,
			fontWeight: 600,
			[variants('regular')]: {
				fontWeight: 900
			},
			[variants('reaction')]: {
				fontStyle: 'italic'
			}
		},
		cost: {
			marginLeft: 'auto',
			fontSize: '0.75em'
		},
		body: {
			fontSize: '0.8em'
		},
		restrictions: {
			display: 'block',
			fontStyle: 'italic',
			marginBottom: css.spacing.xs,
			color: css.palette.red
		}
	});
</script>

<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from './utils';
	import EffectsText from './EffectsText.svelte';
	import InlineSvg from './InlineSvg.svelte';
	import CostDisplay from './CostDisplay.svelte';
	import { getCapabilityIcon, getCapabilityTitle } from '#lib/cardattributes';

	interface Props extends StandardAttributeProps {
		capability: Capability;
	}

	const { capability, ...attributes }: Props = $props();
	const styles = $derived(stylesFor(capability.type === 'reaction' ? 'reaction' : 'regular'));
	const title = $derived(getCapabilityTitle(capability));
</script>

<div {...standardAttributes(attributes, styles.capabilityDisplay)}>
	<div class={styles.entry}>
		<div class={styles.header}>
			<InlineSvg class={styles.icon} src={getCapabilityIcon(capability)} />
			<div class={styles.title}>
				{title}
			</div>
			{#if capability instanceof ConcreteCapability && !capability.cost.empty()}
				<CostDisplay class={styles.cost} cost={capability.cost} />
			{/if}
		</div>
		<div class={styles.body}>
			{#if capability instanceof ConcreteCapability && capability.restrictions}
				<div class={styles.restrictions}>
					<EffectsText effects={capability.restrictions} />
				</div>
			{/if}
			<EffectsText effects={capability.effects} />
		</div>
	</div>
</div>
