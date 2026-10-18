import type { AssetData } from '#lib/models/cards';

export default {
	title: "Capa d'invisibilitat",
	properties: ['magic', 'object'],
	hidden: true,
	capabilities: [
		{
			title: 'Passar desapercebut',
			type: 'constant',
			effects: 'Repeteix els daus fallits en resoldre els {plots} que hagis iniciat.'
		}
	]
} satisfies AssetData;
