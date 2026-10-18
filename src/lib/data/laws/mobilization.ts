import type { LawData } from '#lib/models/cards';

export default {
	title: 'Llei de mobilització',
	properties: ['privilege'],
	capabilities: [
		{
			type: 'constant',
			title: 'Privilegi',
			effects: '{augments} el {marshal} del regne.'
		},
		{
			type: 'action',
			title: 'Cridar a files',
			cost: { favour: 1 },
			effects: 'Cada {kingdom-member} perd {any 1} i guanya {strength 1}.'
		}
	]
} satisfies LawData;
