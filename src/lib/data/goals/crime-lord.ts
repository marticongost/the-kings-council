import type { GoalData } from '#lib/models/cards';
import { biggestHoarderGoalReaction } from '../reusable-definitions';

export default {
	title: 'Senyor del crim',
	goalType: 'personal',
	capabilities: [biggestHoarderGoalReaction('cartes amb el tret {illicit}')]
} satisfies GoalData;
