<script lang="ts" module>
	import * as css from '#lib/styles';
	import { getCardBackgroundName } from '#lib/cardattributes';

	const cardSize = css.cards.standard;
	const fateCardSize = css.cards.tarot;

	const variant = css.styleVariants<CardType>(cardTypes);

	// The header is 30mm tall on the standard card; it scales with the card width.
	const headerHeight = (size: css.cards.CardSize) => size.cw((30 / cardSize.width) * 100);

	// Fate card artwork is generated at 3:2. It is painted underneath the card background, so
	// the type's band and its zigzag edge are drawn over the top of it while the artwork shows
	// through below the notches. It hangs 5% of the card width below the top so that the band
	// covers less of it, and the header spans it so that the body starts at its lower edge.
	const fateArtworkHeight = fateCardSize.cw((2 / 3) * 100);
	const fateArtworkOffset = fateCardSize.cw(15);
	const fateCardBackground = {
		...fateCardSize.dimensions(),
		backgroundSize: `100% auto, 100% ${fateArtworkHeight}`,
		backgroundPosition: `0 0, 0 ${fateArtworkOffset}`
	};
	const fateCard = {
		[variant('crisis')]: fateCardBackground,
		[variant('event')]: fateCardBackground
	};
	const fateHeader = {
		[variant('crisis')]: { height: `calc(${fateArtworkHeight} + ${fateArtworkOffset})` },
		[variant('event')]: { height: `calc(${fateArtworkHeight} + ${fateArtworkOffset})` }
	};

	const stylesFor = css.multipleStyles({
		card: {
			...css.column(),
			position: 'relative',
			fontFamily: css.fonts.text,
			backgroundColor: css.palette.white,
			color: css.text.regularColor,
			backgroundSize: '100% auto',
			backgroundRepeat: 'no-repeat',
			...cardSize.dimensions(),
			...fateCard
		},
		header: {
			...css.column(),
			position: 'relative',
			color: css.palette.white,
			height: headerHeight(cardSize),
			...fateHeader,
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
				width: cardSize.cw(20),
				height: cardSize.cw(20)
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

	function getBackgroundImage(card: Card, artwork: string | undefined): string {
		const background = `url(/svg/card-backgrounds/${getCardBackgroundName(card)}.svg)`;
		return artwork ? `${background}, url(${artwork})` : background;
	}
</script>

<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from '#lib/components/utils';
	import { getCardImage } from '#lib/assets/img';
	import { cardTypes, isFateCard, type Card, type CardType } from '#lib/models/cards';
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
	const artwork = $derived(isFateCard(card) ? getCardImage(card.id) : undefined);
</script>

<div
	{...standardAttributes(attributes, styles.card)}
	data-type={card.type}
	style:background-image={getBackgroundImage(card, artwork)}
>
	<div class={styles.header}>
		<div class={styles.title}>{card.title}</div>
		{#if !isFateCard(card)}
			<div class={styles.iconFrame}>
				<InlineSvg class={styles.icon} src={icon} />
			</div>
		{/if}
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
