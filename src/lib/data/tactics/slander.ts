import { type TacticData } from '#lib/models/cards';

export default {
	title: 'Difamar',
	discardBonus: { intrigue: 1 },
	properties: ['machination'],
	capabilities: [
		{
			type: 'secret',
			cost: { power: 2 },
			effects:
				'Resol un {plot} {input intrigue} contra {input player}. Si el {plot} té èxit, el jugador escollit perd {prestige 1}.'
		}
	]
} satisfies TacticData;
