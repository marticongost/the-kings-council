import type { GoalData } from '#lib/models/cards';
import { lowKingdomStatGoalReaction } from '../reusable-definitions';

export default {
	title: 'Ovella negra',
	goalType: 'collective',
	capabilities: [lowKingdomStatGoalReaction('stability')]
} satisfies GoalData;
