import type { CrisisData } from '#lib/models/cards';

export default {
	title: 'Mala collita',
	test: '{gold}',
	fortuneEffects: {
		text: '{danger 1}',
		compute: () => 1
	},
	highestContributionReward: '{prestige 1}',
	penalty: 'El regne pateix {stability -2}.'
} satisfies CrisisData;
