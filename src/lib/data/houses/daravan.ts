import type { HouseData } from '#lib/models/cards';
import { doubleFavourHouseTrait } from '../reusable-definitions';

export default {
	title: 'Casa Daravan',
	capabilities: [doubleFavourHouseTrait('Sempre endavant', "en pagar el cost d'una {tactic}")]
} satisfies HouseData;
