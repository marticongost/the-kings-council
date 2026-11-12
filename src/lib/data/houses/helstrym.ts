import type { HouseData } from '#lib/models/cards';
import { biggestHoarderHouseReward } from '../reusable-definitions';

export default {
	title: 'Casa Helstrym',
	capabilities: [biggestHoarderHouseReward('Déu, Rei i família', 'retinue', ['strength', 'faith'])]
} satisfies HouseData;
