import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Taverna',
	properties: ['land'],
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects: 'Guanyar {intrigue 1}.'
		},
		{
			title: 'Una ronda per tots!',
			type: 'action',
			cost: { gold: '2 + {kingdom-stat-friction}' },
			effects: 'El teu regne guanya {stability 1}.'
		}
	]
} satisfies AssetData;
