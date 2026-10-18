import { type TacticData } from '#lib/models/cards';

export default {
	title: 'Crueltat',
	discardBonus: { power: 1 },
	properties: ['machination', 'selfishness'],
	capabilities: [
		{
			title: 'Res més que bruts pagesos...',
			type: 'secret',
			effects:
				'Resol un {plot} {input intrigue} contra el teu regne. Si té èxit, el regne rep {stability -1} (has de pagar {intrigue}={kingdom-stat-friction}) i tu guanyes {prestige 1} i {power 1}.'
		}
	]
} satisfies TacticData;
