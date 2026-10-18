<script lang="ts" module>
	import * as css from '#lib/styles';

	const cardWidth = 63;
	const cardHeight = 88;

	function cw(percent: number) {
		return `${(cardWidth * percent) / 100}mm`;
	}

	const variant = css.styleVariants<CardType>(cardTypes);

	const stylesFor = css.multipleStyles({
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
			height: '30mm',
			[variant('office')]: {
				height: '9.4mm',
				justifyContent: 'center'
			}
		},
		title: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			height: '9.4mm',
			width: '100%',
			fontWeight: 900,
			margin: 0,
			textAlign: 'center',
			textShadow: '0 0 0.2em rgba(0,0,0,0.3)'
		},
		iconFrame: {
			position: 'relative',
			alignSelf: 'flex-start',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			[variant('office')]: {
				position: 'absolute',
				left: 0,
				top: 0,
				width: cw(20),
				height: cw(20)
			}
		},
		icon: {
			position: 'relative',
			width: '19%',
			height: 'auto',
			zIndex: 2,
			color: css.palette.white,
			filter: 'drop-shadow(0 0 0.2em rgba(0,0,0,0.3))',
			[variant('office')]: {
				width: '60%',
				top: '-10%'
			},
			[variant('house')]: {
				width: '25%'
			}
		},
		body: {
			...css.column('sm'),
			padding: css.spacing.sm,
			flex: '1 1 auto',
			[variant('office')]: {
				paddingTop: css.spacing.md
			}
		},
		footer: {
			...css.row('sm'),
			...css.hpadding('sm'),
			height: '8mm',
			backgroundColor: css.palette.carrara
		},
		discardBonus: {
			opacity: 0.7,
			marginLeft: 'auto'
		},
		properties: {
			margin: 0,
			listStyleType: 'none',
			color: css.text.subtleColor,
			lineHeight: '1em'
		},
		propertyEntry: {
			margin: 0,
			fontSize: '0.8em',
			display: 'inline',
			'&:not(:last-child):after': {
				content: '", "'
			}
		},
		visibilityIcon: {
			opacity: '0.8'
		}
	});

	function getBackgroundImage(card: Card): string {
		if (card.type === 'asset' && card.hidden) {
			return 'url(/svg/card-backgrounds/hidden-asset.svg)';
		} else if (card.type === 'goal') {
			return `url(/svg/card-backgrounds/${card.goalType}-goal.svg)`;
		}
		return `url(/svg/card-backgrounds/${card.type}.svg)`;
	}
</script>

<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from '#lib/components/utils';
	import { cardTypes, type Card, type CardType } from '#lib/models/cards';
	import CapabilityDisplay from './CapabilityDisplay.svelte';
	import InlineSvg from './InlineSvg.svelte';
	import { getCardIcon } from '#lib/cardattributes';
	import CostDisplay from './CostDisplay.svelte';
	import CrisisDetails from './CrisisDetails.svelte';

	interface Props extends StandardAttributeProps {
		card: Card;
	}

	const { card, ...attributes }: Props = $props();
	const icon = $derived(getCardIcon(card));
	const styles = $derived(stylesFor(card.type));
</script>

<div
	{...standardAttributes(attributes, styles.card)}
	data-type={card.type}
	style:background-image={getBackgroundImage(card)}
>
	<div class={styles.header}>
		<div class={styles.title}>{card.title}</div>
		<div class={styles.iconFrame}>
			<InlineSvg class={styles.icon} src={icon} />
		</div>
	</div>
	<div class={styles.body}>
		{#if card.type === 'crisis'}
			<CrisisDetails crisis={card} />
		{/if}
		{#each card.capabilities as capability, index (index)}
			<CapabilityDisplay {capability} />
		{/each}
	</div>
	<div class={styles.footer}>
		<InlineSvg
			class={styles.visibilityIcon}
			src="keywords/{card.hidden ? 'hidden' : 'visible'}.svg"
		/>
		<ul class={styles.properties}>
			{#each card.properties as property (property.id)}
				<li class={styles.propertyEntry}>{property.title}</li>
			{/each}
		</ul>
		{#if card.type === 'tactic' && !card.discardBonus.empty()}
			<CostDisplay class={styles.discardBonus} cost={card.discardBonus} />
		{/if}
	</div>
</div>
