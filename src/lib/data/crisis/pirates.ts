import type { CrisisData } from '#lib/models/cards';

export default {
	title: 'Pirates',
	test: '{strength}',
	challenge: {
		text: '{danger 2}',
		compute: () => 2
	},
	highestContributionReward: '{prestige 1}, {power 2}',
	penalty:
		'El regne pateix {stability -1} i {wealth -1}. Els {kingdom-members} que menys hagin contribuit perden la meitat del seu {gold}.'
} satisfies CrisisData;
