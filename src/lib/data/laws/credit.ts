import type { LawData } from '#lib/models/cards';

export default {
	title: 'Llei de crèdit',
	properties: ['privilege'],
	capabilities: [
		{
			type: 'constant',
			title: 'Privilegi',
			effects: '{augments} el {treasurer} del regne. Deute: {input number}.'
		},
		{
			type: 'action',
			title: 'Demanar crèdit',
			cost: { favour: 1 },
			effects:
				'Augmentar Deute en X {input number} i guanyar X {gold}. Deute no pot superar {wealth}.'
		},
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects:
				'Si Deute > 0: el {treasurer} paga {gold} = Deute; si no pot, {wealth -1}. A continuació, reduir Deute en 1.'
		}
	]
} satisfies LawData;
