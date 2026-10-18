import type { CrisisData } from '#lib/models/cards';

export default {
	title: 'Guerra',
	properties: ['adversity'],
	test: '{might} + {strength}',
	difficulty: '{kingdom-members} × ({danger} + 1)',
	highestContributionReward: '{prestige 2}, robar carta ({land})',
	penalty:
		'El regne pateix {stability -2}, {wealth -2} i {might -2}. Els jugadors que menys hagin contribuit perden {prestige 1} i un {asset} {land} aleatori.'
} satisfies CrisisData;
