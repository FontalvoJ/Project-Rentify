export interface UpdateCar {
    brand?: string;
    model?: string;
    color?: string;
    pricePerDay?: number;
    location?: string;
    power?: number;

    isAvailable?: boolean;

    systemId?: string;
    companionTypeId?: string;
}