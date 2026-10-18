import type { LawData } from '#lib/models/cards';

export default {
	title: "Llei d'emergència",
	capabilities: [
		{
			title: 'Emergència',
			type: 'constant',
			effects:
				'Si està en vigor, els súbdits del {king} han de renunciar als X primers recursos que guanyin durant el torn, on X és el nombre de {kingdom-stats} amb valor 1. A canvi, el {king} augmenta en X × súbdits el {favour} que reparteix cada torn.'
		}
	]
} satisfies LawData;
