import type { OfficeData } from '#lib/models/cards';
import { getOfficeName } from '#lib/models/offices';

export default {
	title: getOfficeName('treasurer'),
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects: 'Guanyar {gold 2}.'
		},
		{
			title: 'Augmentar els ingressos',
			type: 'action',
			cost: { gold: '3 + {kingdom-stat-friction}' },
			effects: 'El teu regne guanya {wealth 1}.'
		},
		{
			title: 'Fixar impostos',
			type: 'action',
			cost: { power: '1 + {friction}' },
			effects:
				'Moure {wealth} un espai en qualsevol direcció. Canviar {stability} en la mateixa quantitat, en la direcció oposada.'
		}
	]
} satisfies OfficeData;
