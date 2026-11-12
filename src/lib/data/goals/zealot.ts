import type { GoalData } from '#lib/models/cards';
import { resourceHigherThanKingdomStatGoalReaction } from '../reusable-definitions';

export default {
	title: 'Fanàtic',
	goalType: 'collective',
	capabilities: [resourceHigherThanKingdomStatGoalReaction('grace', 'faith')]
} satisfies GoalData;
