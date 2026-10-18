import type { EventData } from '#lib/models/cards';

export default {
	title: 'Torneig',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'whenRevealed',
			effects:
				'{duel} {strength} entre tots els {players} del regne. Els vencedors guanyen {prestige 1}. Descartar aquesta carta.'
		}
	]
} satisfies EventData;
