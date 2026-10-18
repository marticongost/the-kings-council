import type { OfficeData } from '#lib/models/cards';
import { getOfficeName } from '#lib/models/offices';

export default {
	title: getOfficeName('marshal'),
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects: 'Guanya {strength 2}.'
		},
		{
			title: 'Preparacions de guerra',
			type: 'action',
			cost: { strength: '3 + {kingdom-stat-friction}' },
			effects: 'El teu regne guanya {might 1}.'
		},
		{
			title: 'Intimidació',
			type: 'action',
			effects:
				'{duel} {strength} contra {input kingdom-member}. El perdedor dona tot el seu {favour} al vencedor.'
		}
	]
} satisfies OfficeData;
