import { type TacticData } from '#lib/models/cards';

export default {
	title: 'Reclutament',
	properties: ['boost'],
	discardBonus: { gold: 1 },
	capabilities: [
		{
			type: 'action',
			cost: { strength: '2 + {kingdom-stat-friction}' },
			effects: 'El teu regne guanya {might 1}.'
		}
	]
} satisfies TacticData;
