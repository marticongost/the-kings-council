import { type TacticData } from '#lib/models/cards';

export default {
	title: 'Voltor',
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
