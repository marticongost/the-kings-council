import type { LawData } from '#lib/models/cards';

export default {
	title: 'Llei de la disbauxa',
	properties: ['privilege'],
	capabilities: [
		{
			type: 'constant',
			title: 'Privilegi',
			effects: '{augments} el Bufó del regne.'
		},
		{
			type: 'action',
			title: 'Caos i rauxa',
			cost: { favour: 1 },
			effects: `Llançar 1d6.
				 1 → ±1 a un {kingdom-stat}.
				 2 → Els {kingdom-members} passen les seves {tactics} al següent jugador en sentit horari.
				 3-4 → Els {kingdom-members} descarten les seves {tactics} i en roben 3 de noves.
				 5-6 → Els {kingdom-members} guanyen {any 1}.`
		}
	]
} satisfies LawData;
