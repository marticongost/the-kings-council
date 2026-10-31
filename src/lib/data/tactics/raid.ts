import { type TacticData } from '#lib/models/cards';

export default {
	title: 'Incursió',
	copies: 2,
	discardBonus: { power: 1 },
	properties: ['agression'],
	capabilities: [
		{
			type: 'action',
			effects:
				'Resol un {duel} {strength} contra {input player}. Si guanyes, {exhaust} una de les seves {land} {visible}.'
		}
	]
} satisfies TacticData;
