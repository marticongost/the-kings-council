import type { HouseData } from '#lib/models/cards';
import { biggestHoarderHouseReward } from '../reusable-definitions';

export default {
	title: 'Casa Marwyn',
	capabilities: [biggestHoarderHouseReward('Senyors de les ones', 'maritime', ['gold', 'strength'])]
} satisfies HouseData;
