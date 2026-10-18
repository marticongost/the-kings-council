import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Terrenys de cultiu',
	properties: ['land'],
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects: 'Guanyar {gold 1}.'
		},
		{
			title: 'Collita',
			type: 'action',
			cost: { gold: '2 + {kingdom-stat-friction}' },
			effects: 'El teu regne guanya {stability 1}.'
		}
	]
} satisfies AssetData;
