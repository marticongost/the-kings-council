import type { EventData } from '#lib/models/cards';

export default {
	title: 'Era daurada',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects:
				'Els jugadors seleccionen una quantitat de recursos {any} de la seva reserva i els revelen simultàniament. Si el total és igual o superior a {kingdom-members} × 2, +1 a tots els {kingdom-stats}.'
		}
	]
} satisfies EventData;
