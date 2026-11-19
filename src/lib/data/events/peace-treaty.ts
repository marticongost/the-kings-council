import type { EventData } from '#lib/models/cards';

export default {
	title: 'Tractat de pau',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'whenRevealed',
			effects:
				'Els jugadors seleccionen una quantitat de recursos {power} de la seva reserva i els revelen simultàniament. Si el total és igual o superior a {stability}, el regne guanya {stability 1}.'
		}
	]
} satisfies EventData;
