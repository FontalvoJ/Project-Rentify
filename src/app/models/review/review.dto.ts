export interface Review {
    id: string;
    carId: string;
    clientId: string;
    reservationId: string;

    rating: number;
    comment?: string;

    createdAt: string;
}