<script lang="ts" module>
	import * as css from '#lib/styles';

	const cardWidth = 63;
	const cardHeight = 41;

	const styles = css.styles({
		card: {
			...css.column(),
			position: 'relative',
			fontFamily: css.fonts.text,
			backgroundColor: css.palette.white,
			color: css.text.regularColor,
			width: `${cardWidth}mm`,
			height: `${cardHeight}mm`
		},
		header: {
			...css.column(),
			position: 'relative',
			color: css.palette.white,
			height: '8mm',
			justifyContent: 'center'
		},
		title: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			width: '100%',
			fontWeight: 900,
			fontSize: '0.8em',
			margin: 0,
			textAlign: 'center',
			textShadow: '0 0 0.2em rgba(0,0,0,0.3)'
		},
		iconFrame: {
			alignSelf: 'flex-start',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			position: 'absolute',
			left: 0,
			top: 0,
			width: '10mm',
			height: '10mm'
		},
		icon: {
			position: 'relative',
			width: '55%',
			height: 'auto',
			zIndex: 2,
			color: css.palette.white,
			filter: 'drop-shadow(0 0 0.2em rgba(0,0,0,0.3))',
			top: '-8%'
		},
		body: {
			...css.column('sm'),
			padding: css.spacing.sm,
			flex: '1 1 auto'
		},
		discardAction: {
			...css.row('xs'),
			position: 'absolute',
			right: css.spacing.sm,
			bottom: css.spacing.xs,
			fontSize: '0.7em',
			borderTopLeftRadius: '0.5em'
		},
		discardLabel: {},
		discardBonus: {}
	});

	function getBackgroundImage(cardCapability: CardCapability): string {
		const card = cardCapability.card;
		if (card.type === 'asset' && card.hidden) {
			return 'url(/svg/capability-card-backgrounds/hidden-asset.svg)';
		} else if (card.type === 'goal') {
			return `url(/svg/capability-card-backgrounds/${card.goalType}-goal.svg)`;
		}
		return `url(/svg/capability-card-backgrounds/${card.type}.svg)`;
	}
</script>

<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from '#lib/components/utils';
	import CapabilityDisplay from './CapabilityDisplay.svelte';
	import InlineSvg from './InlineSvg.svelte';
	import type { CardCapability } from '#lib/models/cardcapabilities';
	import { getCardIcon } from '#lib/cardattributes';
	import CostDisplay from './CostDisplay.svelte';

	interface Props extends StandardAttributeProps {
		cardCapability: CardCapability;
	}

	const { cardCapability, ...attributes }: Props = $props();
	const icon = $derived(getCardIcon(cardCapability.card));
</script>

<div
	{...standardAttributes(attributes, styles.card)}
	data-type={cardCapability.card.type}
	style:background-image={getBackgroundImage(cardCapability)}
>
	<div class={styles.header}>
		<div class={styles.title}>{cardCapability.card.title}</div>
		<div class={styles.iconFrame}>
			<InlineSvg class={styles.icon} src={icon} />
		</div>
	</div>
	<div class={styles.body}>
		<CapabilityDisplay capability={cardCapability.capability} />
		{#if cardCapability.card.type === 'tactic'}
			<div class={styles.discardAction}>
				<span class={styles.discardLabel}>... o descartar per</span>
				<CostDisplay class={styles.discardBonus} cost={cardCapability.card.discardBonus} />
			</div>
		{/if}
	</div>
</div>
