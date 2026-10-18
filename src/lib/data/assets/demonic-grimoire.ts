import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Grimori demoníac',
	properties: ['magic', 'object', 'illicit'],
	hidden: true,
	capabilities: [
		{
			title: 'Ritual blasfem',
			type: 'secret',
			cost: { power: 1, intrigue: 1 },
			effects:
				'Resoldre un {plot} {input intrigue} contra el teu regne. Si té èxit, el teu regne pateix {input check} {wealth -1} o {input check} {stability -1} o {input check} {grace -1} (has de pagar {intrigue}={kingdom-stat-friction}) i tu guanyes {power 3} i {prestige 1}.'
		}
	]
} satisfies AssetData;
