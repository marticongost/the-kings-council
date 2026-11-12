import type { HouseData } from '#lib/models/cards';
import { biggestHoarderHouseReward } from '../reusable-definitions';

export default {
	title: 'Casa Tolgrund',
	capabilities: [biggestHoarderHouseReward('Cridats a la glòria', 'luxury', ['gold', 'power'])]
} satisfies HouseData;
