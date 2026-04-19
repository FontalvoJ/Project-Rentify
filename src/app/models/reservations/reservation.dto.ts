export interface Reservation {
    id: string;
    car: string;
    carId: string;
    clientId?: string;
    clientName?: string | null;

    startDate: string;
    endDate: string;

    totalDays: number;
    totalCost: number;

    originalCost?: number;
    discountApplied?: boolean;
    discountPercentage?: number;

    status: string;
    paymentStatus: 'Pendiente' | 'Pagado';
    createdAt?: string;
}