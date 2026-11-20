import type { CrisisData } from '#lib/models/cards';

export default {
	title: 'Plaga',
	test: '{any}',
	challenge: {
		text: '{danger 3}',
		compute: () => 3
	},
	highestContributionReward: '{prestige 1}',
	penalty:
		'El regne pateix {stability -1} i {wealth -1}. Els {kingdom-members} perden la meitat de les seves cartes {retinue} (arrodonint cap a dalt), seleccionades aleatòriament.'
} satisfies CrisisData;
