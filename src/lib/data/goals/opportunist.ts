import type { GoalData } from '#lib/models/cards';
import { resourceHigherThanKingdomStatGoalReaction } from '../reusable-definitions';

export default {
	title: 'Oportunista',
	goalType: 'collective',
	capabilities: [resourceHigherThanKingdomStatGoalReaction('stability', 'power')]
} satisfies GoalData;
