import type { EventData } from '#lib/models/cards';

export default {
	title: 'Generositat reial',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'whenRevealed',
			effects:
				"El {king} revela tantes cartes com {kingdom-members}, i en dona una a cada un. El {king} escull quina carta donar a cada jugador, i s'assigna una de les cartes a si mateix. Descartar aquesta carta."
		}
	]
} satisfies EventData;
