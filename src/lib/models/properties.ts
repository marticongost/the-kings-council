const propertyData = {
	// Card types (implicit properties)
	common: 'Accions comunes',
	event: 'Esdeveniment',
	crisis: 'Crisis',
	office: 'Càrrec',
	goal: 'Objectiu',
	tactic: 'Tàctica',
	asset: 'Actiu',
	law: 'Llei',
	house: 'Casa',

	// Card sub-types (explicit properties)
	machination: 'Maquinació',
	agression: 'Agressió',
	object: 'Objecte',
	magic: 'Màgia',
	land: 'Terres',
	retinue: 'Sèquit',
	illicit: 'Il·lícit',
	luxury: 'Luxe',
	military: 'Militar',
	knowledge: 'Coneixement',
	maritime: 'Marítim',
	selfishness: 'Egoïsme',
	boost: 'Millora',
	food: 'Menjar',
	adversity: 'Adversitat',
	holy: 'Sagrat',
	privilege: 'Privilegi'
} as const;

export type PropertyId = keyof typeof propertyData;

export class Property {
	readonly id: PropertyId;
	readonly title: string;

	constructor(id: PropertyId, title: string) {
		this.id = id;
		this.title = title;
	}
}

const propertiesMap = {} as Record<PropertyId, Property>;

for (const [id, title] of Object.entries(propertyData)) {
	const propertyId = id as PropertyId;
	propertiesMap[propertyId] = new Property(propertyId, title);
}

export function getProperty(id: PropertyId): Property {
	return propertiesMap[id];
}

export function getProperties(): ReadonlyArray<Property> {
	return Object.values(propertiesMap);
}
