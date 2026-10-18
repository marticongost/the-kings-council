import type { CrisisData } from '#lib/models/cards';

export default {
	title: 'Escàndol',
	test: '{intrigue}',
	difficulty: '{kingdom-members} × {danger}',
	highestContributionReward: '{prestige 1}',
	penalty:
		'El regne pateix {stability -2}. El jugador amb més {prestige} del regne perd els seus càrrecs.'
} satisfies CrisisData;
