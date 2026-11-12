import type { HouseData } from '#lib/models/cards';
import { doubleFavourHouseTrait } from '../reusable-definitions';

export default {
	title: 'Casa Sarkan',
	capabilities: [doubleFavourHouseTrait('Comerciants despiadats', 'a la {assets-bid}')]
} satisfies HouseData;
