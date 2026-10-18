import type { LawData } from '#lib/models/cards';

export default {
	title: "Llei d'impost a la propietat",
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects:
				'Si està en vigor, cada {players} del regne (excloent el {treasurer} i el {king}) que tingui 2+ {land} {visible} ha de pagar {gold 1} al {treasurer}.'
		}
	]
} satisfies LawData;
