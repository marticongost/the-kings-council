import type { EventData } from '#lib/models/cards';

export default {
	title: 'Acord secret',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'whenRevealed',
			effects:
				'{duel} {intrigue} entre tots els {kingdom-members}. Els guanyadors guanyen {prestige 1}. Descartar aquesta carta.'
		}
	]
} satisfies EventData;
