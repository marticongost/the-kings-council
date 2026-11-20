import type { CrisisData } from '#lib/models/cards';

export default {
	title: 'Croada',
	test: '{faith} + {strength}',
	challenge: {
		text: '{danger 2}',
		compute: () => 2
	},
	highestContributionReward: '{prestige 1}, {power 2}',
	penalty:
		'El regne pateix {grace -1} i {might -1}. Els jugadors que menys hagin contribuit perden {power 2} i {faith 2}.'
} satisfies CrisisData;
