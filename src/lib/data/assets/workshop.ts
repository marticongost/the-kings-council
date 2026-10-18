import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Taller',
	properties: ['land'],
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects: 'Guanyar {gold 1}.'
		},
		{
			title: 'Producció',
			type: 'action',
			cost: { gold: '2 + {kingdom-stat-friction}' },
			effects: 'El teu regne guanya {wealth 1}.'
		}
	]
} satisfies AssetData;
