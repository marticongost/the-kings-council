import type { CrisisData } from '#lib/models/cards';

export default {
	title: 'Mala collita',
	properties: ['adversity'],
	test: '{gold}',
	difficulty: '{kingdom-members} × {danger}',
	highestContributionReward: '{prestige 1}',
	penalty: 'El regne pateix {stability -2}.'
} satisfies CrisisData;
