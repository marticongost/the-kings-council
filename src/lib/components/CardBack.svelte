<script lang="ts" module>
	import * as css from '#lib/styles';
	import { cardTypes, type Card, type CardType } from '#lib/models/cards';

	const variant = css.styleVariants<CardType>(cardTypes);

	const fateCard = {
		[variant('crisis')]: css.cards.tarot.dimensions(),
		[variant('event')]: css.cards.tarot.dimensions()
	};

	const stylesFor = css.multipleStyles({
		cardBack: {
			...css.cards.standard.dimensions(),
			...fateCard
		}
	});

	function getBackgroundImage(card: Card): string | undefined {
		if (card.type === 'asset' && card.hidden) {
			return 'url(/svg/card-back-backgrounds/hidden-asset.svg)';
		} else if (card.type === 'goal') {
			return `url(/svg/card-back-backgrounds/${card.goalType}-goal.svg)`;
		} else if (card.type === 'common') {
			// Common action cards have no dedicated back artwork.
			return undefined;
		}
		return `url(/svg/card-back-backgrounds/${card.type}.svg)`;
	}
</script>

<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from '#lib/components/utils';

	interface Props extends StandardAttributeProps {
		card: Card;
	}

	const { card, ...attributes }: Props = $props();
	const styles = $derived(stylesFor(card.type));
</script>

<div
	{...standardAttributes(attributes, styles.cardBack)}
	data-type={card.type}
	style:background-image={getBackgroundImage(card)}
></div>
