import type { EventData } from '#lib/models/cards';

export default {
	title: 'Cacera',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'whenRevealed',
			effects:
				'{duel} {power} entre tots els {kingdom-members}. Els vencedors guanyen {prestige 1}. Descartar aquesta carta.'
		}
	]
} satisfies EventData;
