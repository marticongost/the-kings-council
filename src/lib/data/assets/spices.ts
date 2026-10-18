import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Espècies',
	properties: ['object', 'food'],
	hidden: false,
	capabilities: [
		{
			title: "Valuoses com l'or",
			type: 'action',
			cost: { power: '3 + {kingdom-stat-friction}' },
			effects: 'El teu regne guanya {wealth 1}. Guanyar {gold 1}.'
		}
	]
} satisfies AssetData;
