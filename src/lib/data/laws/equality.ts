import type { LawData } from '#lib/models/cards';

export default {
	title: "Llei d'igualtat",
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnEnd',
			effects:
				"Si està en vigor, el membre del regne amb més {prestige} dona {prestige 1} al membre del regne amb menys {prestige}. Ignorar l'efecte si la diferència entre tots dos és d'1 {prestige}."
		}
	]
} satisfies LawData;
