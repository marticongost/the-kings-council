import { type TacticData } from '#lib/models/cards';

export default {
	title: 'Voltor',
	copies: 2,
	discardBonus: { intrigue: 1 },
	properties: ['selfishness'],
	capabilities: [
		{
			type: 'action',
			cost: { intrigue: 1 },
			effects: 'Per cada {kingdom-stat} amb valor 1 guanyes {gold 1} i {power 1}.'
		}
	]
} satisfies TacticData;
