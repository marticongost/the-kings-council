import type { CrisisData } from '#lib/models/cards';

export default {
	title: 'Bandolers',
	properties: ['adversity'],
	test: '{strength}',
	difficulty: '{kingdom-members} × {danger}',
	penalty:
		'El regne pateix {stability -1} i {wealth -1}. Els {kingdom-members} que menys hagin contribuit perden un {asset} {object} aleatori.',
	highestContributionReward: `{prestige 1}, {power 2}`
} satisfies CrisisData;
