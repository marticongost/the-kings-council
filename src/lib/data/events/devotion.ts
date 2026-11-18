import type { EventData } from '#lib/models/cards';

export default {
	title: 'Devoció',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'whenRevealed',
			effects:
				'{duel} {faith} entre tots els {kingdom-members}. Els vencedors guanyen {prestige 1}.'
		}
	]
} satisfies EventData;
