import type { OfficeData } from '#lib/models/cards';
import { getOfficeName } from '#lib/models/offices';

export default {
	title: getOfficeName('spy-master'),
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects: 'Guanyar {intrigue 3}, robar carta ({machination}).'
		},
		{
			title: 'Contraespionatge',
			type: 'constant',
			effects:
				"La teva {vigilance} s'oposar a qualsevol {plot} al regne (no només els dirigits contra tu)."
		},
		{
			title: 'Mirar cap a una altra banda',
			type: 'indication',
			effects: 'Els següents {players} estan exclosos de la teva protecció: {input kingdom-members}'
		}
	]
} satisfies OfficeData;
