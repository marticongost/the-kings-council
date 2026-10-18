import type { LawData } from '#lib/models/cards';

export default {
	title: "Llei d'exaltació",
	capabilities: [
		{
			type: 'reaction',
			trigger: 'spendingFavour',
			effects:
				"Si està en vigor, si el jugador que està gastant {favour} té més {prestige} que el {king}, el {king} guanya {prestige 1}. Límit d'un cop per torn."
		}
	]
} satisfies LawData;
