import { type TacticData } from '#lib/models/cards';

export default {
	title: 'El fi justifica els mitjans',
	discardBonus: { power: 1 },
	capabilities: [
		{
			type: 'action',
			effects:
				'Intercanvia fins a 3 {any} per la mateixa quantitat de {gold}, {power}, {strength}, {faith} o {intrigue}.'
		}
	]
} satisfies TacticData;
