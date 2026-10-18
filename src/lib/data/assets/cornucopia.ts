import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Cornucòpia',
	properties: ['magic', 'object'],
	hidden: true,
	capabilities: [
		{
			title: 'Abundància',
			type: 'secret',
			cost: { power: '3 + {kingdom-stat-friction}' },
			effects: 'Guanyar {prestige 1}. El teu regne guanya {stability 1}.'
		}
	]
} satisfies AssetData;
