import type { CrisisData } from '#lib/models/cards';

export default {
	title: 'Senyal apocalíptica',
	test: '{faith}',
	challenge: {
		text: '{danger 2}. Els {kingdom-members} perden {faith 1}.',
		compute: () => 2
	},
	highestContributionReward: '{prestige 2}',
	penalty:
		'El regne pateix {stability -1}, {wealth -1}, {might -1} i {grace -1}. Els jugadors que menys hagin contribuit perden {prestige 1} i tots els seus {assets} {holy}.'
} satisfies CrisisData;
