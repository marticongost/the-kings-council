import { type TacticData } from '#lib/models/cards';

export default {
	title: 'Replegament',
	discardBonus: { power: 1 },
	properties: ['machination', 'selfishness'],
	capabilities: [
		{
			title: 'No els calen les meves tropes...',
			type: 'secret',
			effects:
				'Resol un {plot} {input intrigue} contra el teu regne. Si té èxit, el regne rep {might -1} (has de pagar {intrigue}={kingdom-stat-friction}) i tu guanyes {prestige 1} i {strength 1}.'
		}
	]
} satisfies TacticData;
