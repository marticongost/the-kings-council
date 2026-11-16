import type { CrisisData } from '#lib/models/cards';

export default {
	title: 'Escàndol',
	test: '{intrigue}',
	fortuneEffects: {
		text: '{danger 1}',
		compute: () => 1
	},
	highestContributionReward: '{prestige 1}',
	penalty:
		'El regne pateix {stability -2}. El jugador amb més {prestige} del regne perd els seus càrrecs.'
} satisfies CrisisData;
