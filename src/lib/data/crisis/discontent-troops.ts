import type { CrisisData } from '#lib/models/cards';

export default {
	title: 'Malestar entre les tropes',
	test: '{gold}',
	challenge: {
		text: '{danger 1}',
		compute: () => 1
	},
	highestContributionReward: '{prestige 1}',
	penalty:
		'El regne pateix {might -1}. Els {kingdom-members} que menys hagin contribuit perden {might}={danger}.'
} satisfies CrisisData;
