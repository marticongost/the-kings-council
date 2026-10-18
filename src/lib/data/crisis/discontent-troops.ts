import type { CrisisData } from '#lib/models/cards';

export default {
	title: 'Malestar entre les tropes',
	properties: ['adversity'],
	test: '{gold}',
	difficulty: '{kingdom-members} × {danger}',
	highestContributionReward: '{prestige 1}',
	penalty:
		'El regne pateix {might -1}. Els {kingdom-members} que menys hagin contribuit perden {might}={danger}.'
} satisfies CrisisData;
