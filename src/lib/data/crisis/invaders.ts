import type { CrisisData } from '#lib/models/cards';

export default {
	title: 'Invasió',
	properties: ['adversity'],
	test: '{strength}',
	difficulty: '{kingdom-members} × {danger} + {wealth}',
	penalty: 'El regne pateix {stability -1}. Cada membre del regne perd un {asset} aleatòri.',
	highestContributionReward: `{prestige 1}`
} satisfies CrisisData;
