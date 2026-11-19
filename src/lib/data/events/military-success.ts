import type { EventData } from '#lib/models/cards';

export default {
	title: 'Èxits militars',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'whenRevealed',
			effects:
				'Els jugadors seleccionen una quantitat de recursos {strength} de la seva reserva i els revelen simultàniament. Si el total és igual o superior a {might}, el regne guanya {might 1}.'
		}
	]
} satisfies EventData;
