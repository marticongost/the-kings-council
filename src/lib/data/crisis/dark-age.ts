import type { CrisisData } from '#lib/models/cards';
import { kingdomStatTypes } from '#lib/models/kingdomstats';

export default {
	title: 'Era fosca',
	test: '{any}',
	challenge: {
		text: '{danger 1} per cada {kingdom-stat} amb valor < 3',
		compute: (_state, kingdom) => {
			let danger = 0;
			for (const stat of kingdomStatTypes) {
				if (kingdom.stats[stat] < 3) {
					danger++;
				}
			}
			return danger;
		}
	},
	highestContributionReward: '{prestige 1}, incrementar un {kingdom-stat}',
	penalty:
		'Tots els {kingdom-stats} amb valor > 3 es redueixen a 3. Durant la següent fase de producció el regne redueix els recursos produits a la meitat.'
} satisfies CrisisData;
