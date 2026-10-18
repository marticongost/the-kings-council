import type { LawData } from '#lib/models/cards';

export default {
	title: 'Llei de la concòrdia',
	capabilities: [
		{
			title: 'Concòrdia',
			type: 'constant',
			effects:
				'Si està en vigor, incrementa el cost de jugar cartes {agression} en {power 1} (afegit al seu cost normal).'
		}
	]
} satisfies LawData;
