import { type TacticData } from '#lib/models/cards';

export default {
	title: 'Devastar',
	copies: 2,
	discardBonus: { power: 1 },
	properties: ['agression'],
	capabilities: [
		{
			type: 'action',
			cost: { strength: 2 },
			effects:
				'Resol un {duel} {strength} contra {input player}. Si guanyes, {discard} una de les seves {land} {visible}.'
		}
	]
} satisfies TacticData;
