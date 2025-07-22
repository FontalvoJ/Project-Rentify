import { Injectable } from '@angular/core';

export interface AdminUser {
    name: string;
    email: string;
    password: string;
}

export interface ClientUser extends AdminUser {
    identification: string;
    address: string;
    contact: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserFactoryService {

    createUser(role: 'admin', data: any): AdminUser;
    createUser(role: 'client', data: any): ClientUser;
    createUser(role: 'admin' | 'client', data: any): AdminUser | ClientUser {
        const base: AdminUser = {
            name: data.name,
            email: data.email,
            password: data.password,
        };

        if (role === 'client') {
            if (!data.identification || !data.address || !data.contact) {
                throw new Error("Faltan datos obligatorios para cliente.");
            }

            return {
                ...base,
                identification: data.identification,
                address: data.address,
                contact: data.contact,
            };
        }

        return base;
    }
}