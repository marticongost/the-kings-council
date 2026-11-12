import type { GoalData } from '#lib/models/cards';
import { biggestHoarderGoalReaction } from '../reusable-definitions';

export default {
	title: 'Afavorit',
	goalType: 'personal',
	capabilities: [biggestHoarderGoalReaction('{favour}')]
} satisfies GoalData;
