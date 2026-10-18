import type { LawData } from '#lib/models/cards';

export default {
	title: 'Llei de prioritat',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'lawSuggested',
			effects: 'Escollir un {kingdom-stat}: {input text}.'
		},
		{
			title: 'A qualsevol cost',
			type: 'constant',
			effects:
				"Si està en vigor, sempre que l'indicador escollit anés a canviar de valor, el {king} distribueix el canvi entre altres indicadors de la seva elecció. Ha de prioritzar indicadors que puguin canviar. Si no hi ha {king}, s'aplica el canvi original."
		}
	]
} satisfies LawData;
