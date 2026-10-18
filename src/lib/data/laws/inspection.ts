import type { LawData } from '#lib/models/cards';

export default {
	title: "Llei d'inspecció",
	properties: ['privilege'],
	capabilities: [
		{
			type: 'constant',
			title: 'Privilegi',
			effects: '{augments} el {spy-master} del regne.'
		},
		{
			type: 'action',
			title: 'Inspeccionar',
			cost: { favour: 1 },
			effects:
				'El director de joc et revela en secret els {input check} {assets} {hidden} o {input check} un dels {objectives} de {input kingdom-member}.'
		}
	]
} satisfies LawData;
