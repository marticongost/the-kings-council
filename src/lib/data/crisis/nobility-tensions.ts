import type { CrisisData } from '#lib/models/cards';

export default {
	title: 'Tensions amb la noblesa',
	properties: ['adversity'],
	test: '{power}',
	difficulty: '{kingdom-members} × {danger}',
	highestContributionReward: '{prestige 1}',
	penalty:
		'El regne pateix {stability -1} i es descarten totes les lleis en vigor. Els jugadors que menys hagin contribuit perden {prestige 1}.'
} satisfies CrisisData;
