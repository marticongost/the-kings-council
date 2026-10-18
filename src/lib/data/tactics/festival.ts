import { type TacticData } from '#lib/models/cards';

export default {
	title: 'Festival',
	properties: ['boost'],
	discardBonus: { gold: 1 },
	capabilities: [
		{
			type: 'action',
			cost: { gold: '2 + {kingdom-stat-friction}' },
			effects: 'El teu regne guanya {stability 1}.'
		}
	]
} satisfies TacticData;
