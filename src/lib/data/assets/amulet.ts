import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Amulet',
	properties: ['magic', 'object'],
	hidden: true,
	capabilities: [
		{
			type: 'reaction',
			trigger: 'ownerIsExecuted',
			cost: { power: 2 },
			effects: "Descartar aquesta carta per evitar els efectes de l'execució."
		}
	]
} satisfies AssetData;
