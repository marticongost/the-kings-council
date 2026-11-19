import type { EventData } from '#lib/models/cards';

export default {
	title: 'Benedicció divina',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'whenRevealed',
			effects:
				'Els jugadors seleccionen una quantitat de recursos {faith} de la seva reserva i els revelen simultàniament. Si el total és igual o superior a {grace}, el regne guanya {grace 1}.'
		}
	]
} satisfies EventData;
