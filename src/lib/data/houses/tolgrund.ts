import type { HouseData } from '#lib/models/cards';

export default {
	title: 'Casa Tolgrund',
	capabilities: [
		{
			title: 'Cridats a la glòria',
			type: 'action',
			effects:
				'Guanyar {gold 1} o {power 1} si tens 1+ {assets} {visible} amb la propietat {luxury}.'
		}
	]
} satisfies HouseData;
