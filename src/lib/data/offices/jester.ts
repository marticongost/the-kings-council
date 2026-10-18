import type { OfficeData } from '#lib/models/cards';
import { getOfficeName } from '#lib/models/offices';

export default {
	title: getOfficeName('jester'),
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects:
				'Guanya {power 1} o {intrigue 1}. Si ets el {kingdom-member} amb menys {prestige}, guanya {prestige 1}.'
		},
		{
			type: 'constant',
			title: "L'ase dels cops",
			effects:
				'No pots participar en lleis. Perds els teus altres {offices} i no en pots guanyar de nous.'
		},
		{
			title: 'Ridiculitzar',
			type: 'action',
			effects:
				'{duel} {power} + {intrigue} contra {input kingdom-member}. El perdedor dona {prestige 1} al vencedor. Si el bufó guanya el duel per 2 o més, roba una {tactic} aleatòria al rival.'
		}
	]
} satisfies OfficeData;
