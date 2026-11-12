import type { GoalData } from '#lib/models/cards';
import { resourceHigherThanKingdomStatGoalReaction } from '../reusable-definitions';

export default {
	title: 'Monopolista',
	goalType: 'collective',
	capabilities: [resourceHigherThanKingdomStatGoalReaction('wealth', 'gold')]
} satisfies GoalData;
