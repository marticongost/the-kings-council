import { type TacticData } from '#lib/models/cards';

export default {
	title: 'Depravació',
	discardBonus: { power: 1 },
	properties: ['machination', 'selfishness'],
	capabilities: [
		{
			title: 'Llop amb pell de xai',
			type: 'secret',
			effects:
				'Resol un {plot} {input intrigue} contra el teu regne. Si té èxit, el regne rep {grace -1} (has de pagar {intrigue}={kingdom-stat-friction}) i tu guanyes {prestige 1} i {faith 1}.'
		}
	]
} satisfies TacticData;
