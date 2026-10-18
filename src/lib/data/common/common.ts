import type { CommonData } from '#lib/models/cards';

export default {
	title: 'Accions comunes',
	capabilities: [
		{
			type: 'action',
			title: 'Proposar llei',
			cost: { power: 1 },
			effects: 'Sotmetre una llei de la fila a {vote}.'
		},
		{
			type: 'indication',
			title: 'Vigilar',
			effects: 'Paga {input intrigue} per establir la teva {vigilance} a aquesta mateixa quantitat.'
		},
		{
			type: 'indication',
			title: 'Adquisicions',
			effects:
				'Aposta {input gold} per adquirir {input text} i/o {input gold} per adquirir {input text}.'
		},
		{
			type: 'action',
			title: 'Contribuir a la crisi',
			effects:
				'Contribueix amb {input gold} {input power} {input strength} {input faith} {input intrigue} {input favour} a la crisi.'
		},
		{
			type: 'action',
			title: 'Fundar un nou regne',
			cost: { power: '8' },
			effects:
				"Reduir el cost a la meitat per cada jugador que s'hi vulgui unir. Assumir el càrrec de rei del nou regne, i assignar càrrecs entre els membres."
		},
		{
			type: 'action',
			title: 'Unir-se a un regne',
			effects:
				"Sol·licitar entrar al regne {input kingdom}. Resoldre un vot entre els {kingdom-members}; si té èxit, t'hi uneixes."
		}
	]
} satisfies CommonData;
