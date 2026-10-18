import { type TacticData } from '#lib/models/cards';

export default {
	title: 'Traïció',
	discardBonus: { power: 1 },
	properties: ['machination', 'selfishness'],
	capabilities: [
		{
			title: 'Que ha fet el rei per mi?',
			type: 'secret',
			effects:
				'Resol un {plot} {input intrigue} contra el teu regne. Si té èxit, el regne rep {stability -1} (has de pagar {intrigue}={kingdom-stat-friction}) i tu guanyes {prestige 1} i {intrigue 1}.'
		}
	]
} satisfies TacticData;
