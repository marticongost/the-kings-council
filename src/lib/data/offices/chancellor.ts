import type { OfficeData } from '#lib/models/cards';
import { getOfficeName } from '#lib/models/offices';

export default {
	title: getOfficeName('chancellor'),
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects: 'Guanya {power 2}.'
		},
		{
			title: 'Govern',
			type: 'action',
			cost: { power: '3 + {kingdom-stat-friction}' },
			effects: 'El teu regne guanya {stability 1}.'
		},
		{
			title: 'Maniobres polítiques',
			type: 'action',
			cost: { power: 1 },
			effects:
				'Roba una {law} i junta-la amb les cartes a la fila. Descarta una de les cartes, reordena la fila com tu vulguis.'
		},
		{
			title: 'Abolir llei',
			type: 'action',
			cost: { power: 1 },
			effects:
				'Escull una {law} en vigor al teu regne. La llei es sotmet a una nova {vote}. Si el vot fracassa, la llei es descarta.'
		}
	]
} satisfies OfficeData;
