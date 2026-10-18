import { type TacticData } from '#lib/models/cards';

export default {
	title: 'Anticipació',
	discardBonus: { power: 1 },
	properties: [],
	capabilities: [
		{
			type: 'reaction',
			trigger: 'actionActivated',
			cost: { power: 1 },
			effects: "Cancel·lar l'acció i tots els seus efectes."
		}
	]
} satisfies TacticData;
