export interface UpdateCar {
    brand?: string;
    model?: string;
    color?: string;
    pricePerDay?: number;
    location?: string;
    power?: number;

    isAvailable?: string;

    systemId?: string;
    companionTypeId?: string;
}