import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Església',
	properties: ['object', 'holy'],
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects: 'Guanyar {faith 1}.'
		},
		{
			title: 'Pregària',
			type: 'action',
			cost: { faith: 2 },
			effects:
				"Mira en secret les dues següents cartes de destí. Torna una de les cartes a dalt de la pila, descarta l'altra."
		}
	]
} satisfies AssetData;
