import type { OfficeData } from '#lib/models/cards';
import { getOfficeName } from '#lib/models/offices';

export default {
	title: getOfficeName('king'),
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects: 'Reparteix {favour} igual a {kingdom-members} - 2 entre els teus súbdits.'
		},
		{
			title: 'Reorganitzar el consell',
			type: 'action',
			cost: { power: 3 },
			effects: 'Assigna, reassigna o retira qualsevol número de {offices}.'
		},
		{
			title: 'Tirania',
			type: 'action',
			cost: { power: 1 },
			effects:
				'{input kingdom-members} han de donar-te una {card} o un {resource} de la seva el·lecció.'
		}
	]
} satisfies OfficeData;
