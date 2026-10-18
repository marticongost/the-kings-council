import { type TacticData } from '#lib/models/cards';

export default {
	title: 'Penitència',
	properties: ['boost'],
	discardBonus: { gold: 1 },
	capabilities: [
		{
			type: 'action',
			cost: { faith: '2 + {kingdom-stat-friction}' },
			effects: 'El teu regne guanya {grace 1}.'
		}
	]
} satisfies TacticData;
