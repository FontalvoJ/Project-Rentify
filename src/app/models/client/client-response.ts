export interface ClientResponse {
    message: string;
    data: {
        user: {
            name: string;
            email: string;
        };
        client: {
            identification?: string;
            address?: string;
            contact?: string;
        };
    };
}