import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Assassí',
	properties: ['illicit', 'retinue'],
	hidden: true,
	capabilities: [
		{
			title: 'Que sembli un accident...',
			type: 'secret',
			cost: { gold: 5 },
			effects:
				"Resoldre un {plot} {input intrigue} contra {input player}. En cas d'èxit, {execute} el jugador designat."
		}
	]
} satisfies AssetData;
