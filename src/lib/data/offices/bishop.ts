import type { OfficeData } from '#lib/models/cards';
import { getOfficeName } from '#lib/models/offices';

export default {
	title: getOfficeName('bishop'),
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects: 'Guanyar {faith 2}.'
		},
		{
			title: 'Sermó',
			type: 'action',
			cost: { faith: '3 + {kingdom-stat-friction}' },
			effects: 'El teu regne guanya {grace 1}.'
		},
		{
			title: 'Excomulgar',
			type: 'action',
			effects: '{duel} {any} contra {input kingdom-member}. El perdedor és {exiled} del regne.'
		}
	]
} satisfies OfficeData;
