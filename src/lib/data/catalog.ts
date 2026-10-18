import {
	Asset,
	Common,
	Crisis,
	Event,
	Goal,
	House,
	Law,
	Office,
	Tactic,
	type AssetData,
	type Card,
	type CommonData,
	type CrisisData,
	type EventData,
	type GoalData,
	type HouseData,
	type LawData,
	type OfficeData,
	type TacticData
} from '#lib/models/cards';

class CardsCatalog {
	private cards: Record<string, Card> = {};

	load<D>(records: Record<string, D>, cardConstructor: new (id: string, data: D) => Card) {
		for (const [path, data] of Object.entries(records)) {
			const id = pathToId(path);
			const card = new cardConstructor(id, data);
			this.cards[id] = card;
		}
	}

	all(): Array<Card> {
		return Object.values(this.cards);
	}
}

function pathToId(path: string) {
	const start = path.lastIndexOf('/') + 1;
	const end = path.lastIndexOf('.');
	return path.substring(start, end);
}

export const cardsCatalog = new CardsCatalog();

cardsCatalog.load(
	import.meta.glob<CommonData>(`./common/**/*.ts`, {
		eager: true,
		import: 'default'
	}),
	Common
);

cardsCatalog.load(
	import.meta.glob<OfficeData>(`./offices/**/*.ts`, {
		eager: true,
		import: 'default'
	}),
	Office
);

cardsCatalog.load(
	import.meta.glob<GoalData>(`./goals/**/*.ts`, {
		eager: true,
		import: 'default'
	}),
	Goal
);

cardsCatalog.load(
	import.meta.glob<EventData>(`./events/**/*.ts`, {
		eager: true,
		import: 'default'
	}),
	Event
);

cardsCatalog.load(
	import.meta.glob<CrisisData>(`./crisis/**/*.ts`, {
		eager: true,
		import: 'default'
	}),
	Crisis
);

cardsCatalog.load(
	import.meta.glob<TacticData>(`./tactics/**/*.ts`, {
		eager: true,
		import: 'default'
	}),
	Tactic
);

cardsCatalog.load(
	import.meta.glob<AssetData>(`./assets/**/*.ts`, {
		eager: true,
		import: 'default'
	}),
	Asset
);

cardsCatalog.load(
	import.meta.glob<LawData>(`./laws/**/*.ts`, {
		eager: true,
		import: 'default'
	}),
	Law
);

cardsCatalog.load(
	import.meta.glob<HouseData>(`./houses/**/*.ts`, {
		eager: true,
		import: 'default'
	}),
	House
);
