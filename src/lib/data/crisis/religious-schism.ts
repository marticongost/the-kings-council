import type { CrisisData } from '#lib/models/cards';

export default {
	title: 'Cisme religiós',
	properties: ['adversity'],
	test: '{faith}',
	fortuneEffects: {
		text: '{danger 2}',
		compute: () => 2
	},
	highestContributionReward: '{prestige 1}, {power 2}',
	penalty:
		"El regne pateix {grace -2}. Els jugadors que menys hagin contribuit perden un {any} per cada punt pel que s'hagi fracassat."
} satisfies CrisisData;
