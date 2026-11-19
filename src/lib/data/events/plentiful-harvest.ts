import type { EventData } from '#lib/models/cards';

export default {
	title: 'Collita abundant',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'whenRevealed',
			effects:
				'Els jugadors seleccionen una quantitat de recursos {gold} de la seva reserva i els revelen simultàniament. Si el total és igual o superior a {wealth}, el regne guanya {wealth 1}.'
		}
	]
} satisfies EventData;
