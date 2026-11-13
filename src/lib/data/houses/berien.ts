import type { HouseData } from '#lib/models/cards';
import { biggestHoarderHouseReward } from '../reusable-definitions';

export default {
	title: 'Casa Berien',
	capabilities: [biggestHoarderHouseReward("L'escut del regne", 'military', ['strength', 'power'])]
} satisfies HouseData;
