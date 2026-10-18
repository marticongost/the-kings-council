import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Castell',
	properties: ['land'],
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects: 'Guanyar {strength 1}.'
		},
		{
			title: 'Ampliació',
			type: 'action',
			cost: { gold: '2 + {kingdom-stat-friction}' },
			effects: 'El teu regne guanya {might 1}.'
		}
	]
} satisfies AssetData;
