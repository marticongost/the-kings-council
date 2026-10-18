import type { CrisisData } from '#lib/models/cards';

export default {
	title: 'Pirates',
	properties: ['adversity'],
	test: '{strength}',
	difficulty: '{kingdom-members} × {danger}',
	highestContributionReward: '{prestige 1}, {power 2}',
	penalty:
		'El regne pateix {stability -1} i {wealth -1}. Els {kingdom-members} que menys hagin contribuit perden {gold 3}.'
} satisfies CrisisData;
