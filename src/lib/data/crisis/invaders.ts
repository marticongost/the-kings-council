import type { CrisisData } from '#lib/models/cards';

export default {
	title: 'Invasió',
	test: '{strength}',
	challenge: {
		text: '{wealth} - 2 (mínim 1)',
		compute: (_state, kingdom) => Math.max(1, kingdom.stats.wealth - 2)
	},
	penalty:
		"El regne pateix {stability -1}. Cada {kingdom-member} perd un {asset} aleatori per cada fracció de 3 punts pels que s'hagi fracassat (arrodonint amunt).",
	highestContributionReward: `{prestige 1}`
} satisfies CrisisData;
