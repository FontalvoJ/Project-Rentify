//import { RegisterFormData } from './register-form-data';

export class AdminUser {
    constructor(
        public name: string,
        public email: string,
        public password: string,
    ) { }
}

export class ClientUser {
    constructor(
        public name: string,
        public email: string,
        public password: string,
        public identification?: string,
        public address?: string,
        public contact?: string
    ) { }
}