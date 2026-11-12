import type { GoalData } from '#lib/models/cards';
import { biggestHoarderGoalReaction } from '../reusable-definitions';

export default {
	title: 'Arcanista',
	goalType: 'personal',
	capabilities: [biggestHoarderGoalReaction('cartes amb el tret {magic}')]
} satisfies GoalData;
