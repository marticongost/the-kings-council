import type { HouseData } from '#lib/models/cards';

export default {
	title: 'Casa Marwyn',
	capabilities: [
		{
			title: 'Senyors de les ones',
			type: 'action',
			effects:
				'Guanyar {gold 1} o {strength 1} si tens 1+ {assets} {visible} amb la propietat {maritime}.'
		}
	]
} satisfies HouseData;
