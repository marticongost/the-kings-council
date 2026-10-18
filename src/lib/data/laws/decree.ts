import type { LawData } from '#lib/models/cards';

export default {
	title: 'Llei de decrets',
	properties: ['privilege'],
	capabilities: [
		{
			type: 'constant',
			title: 'Privilegi',
			effects: '{augments} el {chancellor} del regne.'
		},
		{
			type: 'action',
			title: 'Decretar',
			cost: { favour: 1 },
			effects: 'Buscar una llei a la pila i posar-la a votació.'
		}
	]
} satisfies LawData;
