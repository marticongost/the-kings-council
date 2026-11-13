interface TriggerData {
	title: string;
}

const triggerData: Record<string, TriggerData> = {
	afterDuelDeclared: { title: 'En declarar-se un duel' },
	afterResolvingAggression: { title: 'Després de resoldre una agressió' },
	afterResolvingCrisis: { title: 'Després de resoldre una crisi' },
	whenInstigatingDuel: { title: 'Quan declaris un duel' },
	whenRevealed: { title: 'En ser revelada' },
	eventRevealed: { title: 'Quan es reveli un esdeveniment' },
	turnStart: { title: 'Inici del torn' },
	turnEnd: { title: 'Final del torn' },
	gameStart: { title: 'Inici de la partida' },
	gameEnd: { title: 'Final de la partida' },
	actionActivated: { title: "Quan s'activi una acció" },
	afterWinningDuel: { title: 'Després de guanyar un duel' },
	lawSuggested: { title: 'Quan entri a votació' },
	voting: { title: 'Quan votis una llei' },
	afterVoting: { title: 'Quan conclogui una votació' },
	ownerIsExecuted: { title: 'Quan siguis executat' },
	playerDiscards: { title: 'Quan descartis una carta' },
	spendingFavour: { title: 'Quan es gasti favor' },
	afterProductionPhase: { title: 'En concloure la fase de producció' },
	uprisingInOwnKingdom: { title: 'Quan el regne pateixi una insurrecció' }
};

export type TriggerType = keyof typeof triggerData;

export class Trigger {
	readonly type: TriggerType;
	readonly title: string;

	constructor(type: TriggerType, { title }: TriggerData) {
		this.type = type;
		this.title = title;
	}
}

const triggersMap = {} as Record<TriggerType, Trigger>;

for (const [type, data] of Object.entries(triggerData)) {
	triggersMap[type] = new Trigger(type, data);
}

export function getTrigger(type: TriggerType): Trigger {
	const trigger = triggersMap[type];
	if (!trigger) {
		throw new Error(`Unknown trigger: ${type}`);
	}
	return trigger;
}
