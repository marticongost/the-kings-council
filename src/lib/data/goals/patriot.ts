import type { GoalData } from '#lib/models/cards';
import { highKingdomStatGoalReaction } from '../reusable-definitions';

export default {
	title: 'Patriota',
	goalType: 'collective',
	capabilities: [highKingdomStatGoalReaction('stability')]
} satisfies GoalData;
