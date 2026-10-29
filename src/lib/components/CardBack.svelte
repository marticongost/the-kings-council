<script lang="ts" module>
	import * as css from '#lib/styles';

	const styles = css.styles({
		cardBack: {
			...css.cards.standard.dimensions()
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
	import { type Card } from '#lib/models/cards';

	interface Props extends StandardAttributeProps {
		card: Card;
	}

	const { card, ...attributes }: Props = $props();
</script>

<div
	{...standardAttributes(attributes, styles.cardBack)}
	data-type={card.type}
	style:background-image={getBackgroundImage(card)}
></div>
