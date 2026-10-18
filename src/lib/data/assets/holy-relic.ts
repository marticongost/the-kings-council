import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Relíquia sagrada',
	properties: ['object', 'holy'],
	capabilities: [
		{
			type: 'reaction',
			trigger: 'eventRevealed',
			cost: { faith: 4 },
			effects: "Si {grace} ≥ 4, descartar l'esdeveniment."
		}
	]
} satisfies AssetData;
