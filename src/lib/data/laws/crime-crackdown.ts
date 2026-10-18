import type { LawData } from '#lib/models/cards';

export default {
	title: 'Llei de persecució al crim',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnEnd',
			effects:
				'Si està en vigor, cada jugador revela 2 cartes aleatòries. Si 1+ de les cartes revelades o dels seus {assets} {visible} tenen el tret {illicit}, {execute} el propietari.'
		}
	]
} satisfies LawData;
