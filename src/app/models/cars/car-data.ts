export interface CarData {
    _id?: string;

    brand: string;
    model: string;
    year: number;
    color: string;

    pricePerDay: number;
    location: string;
    power: number;

    imageUrl: string;

    isAvailable?: boolean;

    systemId?: {
        _id: string;
        type: string;
    };

    companionTypeId?: {
        _id: string;
        amount: number;
    };
}