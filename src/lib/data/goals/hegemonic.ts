import type { GoalData } from '#lib/models/cards';
import { resourceHigherThanKingdomStatGoalReaction } from '../reusable-definitions';

export default {
	title: 'Hegemònic',
	goalType: 'collective',
	capabilities: [resourceHigherThanKingdomStatGoalReaction('might', 'strength')]
} satisfies GoalData;
