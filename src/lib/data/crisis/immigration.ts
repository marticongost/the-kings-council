import type { CrisisData } from '#lib/models/cards';

export default {
	title: 'Immigració',
	properties: ['adversity'],
	test: '{power} + {gold}',
	difficulty: '{kingdom-members} × ({danger} + ½)',
	penalty:
		'El regne pateix {stability -1}. Els {kingdom-members} que menys hagin contribuit perden {power}={danger} × 2.',
	highestContributionReward: `{prestige 1}, {power 2}`
} satisfies CrisisData;
