import { type TacticData } from '#lib/models/cards';

export default {
	title: 'Inversió',
	properties: ['boost'],
	discardBonus: { gold: 1 },
	capabilities: [
		{
			type: 'action',
			cost: { gold: '2 + {kingdom-stat-friction}' },
			effects: 'El teu regne guanya {wealth 1}.'
		}
	]
} satisfies TacticData;
