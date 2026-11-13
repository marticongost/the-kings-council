import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Col·lecció de llibres',
	properties: ['object', 'luxury', 'knowledge'],
	capabilities: [
		{
			type: 'action',
			title: 'Lliçons dels mestres clàssics',
			cost: { power: 1 },
			effects:
				'Robar 3 {tactics}; a continuació, descartar 2 {tactics} (poden ser tant cartes que ja tinguessis com les que acabes de robar).'
		}
	]
} satisfies AssetData;
