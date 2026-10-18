import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Palau',
	properties: ['land', 'luxury'],
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects: 'Guanyar {power 1}.'
		},
		{
			title: 'Banquet',
			type: 'action',
			cost: { gold: '3 + {kingdom-stat-friction}' },
			effects: 'El teu regne guanya {stability 1}.'
		}
	]
} satisfies AssetData;
