import type { CrisisData } from '#lib/models/cards';

export default {
	title: 'Guerra',
	test: '{might} + {strength}',
	fortuneEffects: {
		text: '{danger 3}',
		compute: () => 3
	},
	highestContributionReward: '{prestige 2}, robar carta ({land})',
	penalty:
		"El regne pateix {stability -2}, {wealth -2} i {might -2}. Els jugadors que menys hagin contribuit perden {prestige 1} i un {asset} {land} aleatori per cada 3 punts pels que s'hagi fracassat (arrodonint amunt)."
} satisfies CrisisData;
