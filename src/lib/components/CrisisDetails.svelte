<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		crisis: {
			...css.column('sm'),
			fontSize: '0.8em',
			lineHeight: '1em'
		},
		crisisTest: {
			display: 'block',
			padding: css.spacing.sm,
			borderRadius: css.spacing.xs,
			border: `1px solid ${css.palette.twine}`,
			borderLeftWidth: '3px',
			marginTop: css.spacing.xs
		},
		crisisOutcome: {
			...css.row('sm'),
			alignItems: 'flex-start',
			border: '1px solid currentColor',
			borderRadius: css.spacing.xs,
			borderLeftWidth: '3px',
			padding: css.spacing.sm
		},
		reward: {
			color: css.palette.grass
		},
		penalty: {
			color: css.palette.rose
		},
		crisisOutcomeIcon: {
			flex: '0 0 auto',
			position: 'relative',
			top: '0.2em'
		},
		crisisBody: {
			fontSize: '0.8em',
			...css.column('sm')
		},
		crisisOutcomeValue: {
			color: css.text.regularColor
		},
		fortuneIcon: {
			marginLeft: css.spacing.sm
		}
	});
</script>

<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from './utils';
	import CapabilityInput from './CapabilityInput.svelte';
	import EffectsText from './EffectsText.svelte';
	import InlineSvg from './InlineSvg.svelte';
	import { cx } from '@emotion/css';
	import type { Crisis } from '#lib/models/cards';
	import { getCrisisToken } from '#lib/models/crisis-tokens';

	interface Props extends StandardAttributeProps {
		crisis: Crisis;
	}

	const { crisis: capability, ...attributes }: Props = $props();
	const fortune = getCrisisToken('fortune');
</script>

<div {...standardAttributes(attributes, styles.crisis)}>
	<div class={styles.crisisTest}>
		<EffectsText effects={capability.test} />
		≥
		<CapabilityInput format="number" />
		{#if capability.fortuneEffects.text}
			<InlineSvg
				class={styles.fortuneIcon}
				src="crisis-tokens/fortune.svg"
				title={fortune.title}
				role="img"
				aria-label={fortune.title}
			/>
			<EffectsText effects={capability.fortuneEffects.text} />
		{/if}
	</div>
	<div class={cx(styles.crisisOutcome, styles.reward)}>
		<InlineSvg class={styles.crisisOutcomeIcon} src="capabilities/reward.svg" />
		<EffectsText class={styles.crisisOutcomeValue} effects={capability.highestContributionReward} />
	</div>
	<div class={cx(styles.crisisOutcome, styles.penalty)}>
		<InlineSvg class={styles.crisisOutcomeIcon} src="capabilities/penalty.svg" />
		<EffectsText class={styles.crisisOutcomeValue} effects={capability.penalty} />
	</div>
</div>
