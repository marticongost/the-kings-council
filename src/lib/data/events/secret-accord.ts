import type { EventData } from '#lib/models/cards';

export default {
	title: 'Acord secret',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'whenRevealed',
			effects:
				'{duel} {intrigue} entre tots els {kingdom-members}. Els vencedors guanyen {prestige 1}.'
		}
	]
} satisfies EventData;
