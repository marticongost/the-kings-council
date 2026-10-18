import type { LawData } from '#lib/models/cards';

export default {
	title: 'Llei de moralitat',
	properties: ['privilege'],
	capabilities: [
		{
			type: 'constant',
			title: 'Privilegi',
			effects: '{augments} el {bishop} del regne.'
		},
		{
			type: 'action',
			title: 'Denunciar els excessos',
			cost: { favour: 1 },
			effects:
				"Seleccionar {input kingdom-member} i {input kingdom-member} (excloent el {bishop}): si un dels {players} seleccionats té més {assets} {visible} i {prestige} que l'altre, ha d'escollir entre donar {prestige 1} a l'altre {player} o donar un dels seus {assets} {visible} al {bishop}."
		}
	]
} satisfies LawData;
