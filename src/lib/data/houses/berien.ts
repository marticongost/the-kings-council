import type { HouseData } from '#lib/models/cards';
import { doubleFavourHouseTrait } from '../reusable-definitions';

export default {
	title: 'Casa Berien',
	capabilities: [doubleFavourHouseTrait('Sempre alerta', 'en augmentar la teva {vigilance}')]
} satisfies HouseData;
