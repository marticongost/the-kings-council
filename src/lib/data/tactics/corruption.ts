import { type TacticData } from '#lib/models/cards';

export default {
	title: 'Corrupció',
	discardBonus: { power: 1 },
	properties: ['machination', 'selfishness'],
	capabilities: [
		{
			title: 'Segur que ningú ho notarà...',
			type: 'secret',
			effects:
				'Resol un {plot} {input intrigue} contra el teu regne. Si té èxit, el regne rep {wealth -1} (has de pagar {intrigue}={kingdom-stat-friction}) i tu guanyes {prestige 1} i {gold 1}.'
		}
	]
} satisfies TacticData;
