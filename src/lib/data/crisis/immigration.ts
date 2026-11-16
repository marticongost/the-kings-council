import type { CrisisData } from '#lib/models/cards';

export default {
	title: 'Immigració',
	properties: ['adversity'],
	test: '{power} + {gold}',
	fortuneEffects: {
		text: '{danger 2}',
		compute: () => 2
	},
	penalty:
		'El regne pateix {stability -1}. Els {kingdom-members} que menys hagin contribuit perden tot el seu {power}.',
	highestContributionReward: `{prestige 1}, {power 2}`
} satisfies CrisisData;
