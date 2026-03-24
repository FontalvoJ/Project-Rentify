export interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'client';
    identification?: string;
    address?: string;
    contact?: string;
}