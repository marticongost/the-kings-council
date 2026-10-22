import type { CrisisData } from '#lib/models/cards';

export default {
	title: 'Senyal apocalíptica',
	properties: ['adversity'],
	test: '{faith}',
	difficulty: '{kingdom-members} × ({danger} + 1)',
	highestContributionReward: '{prestige 2}',
	penalty:
		'El regne pateix {stability -1}, {wealth -1}, {might -1} i {grace -1}. Els jugadors que menys hagin contribuit perden {prestige 1} i tots els seus {assets} {holy}.'
} satisfies CrisisData;
