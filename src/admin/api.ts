import { ADMIN_DATA_POST_ARG_ENTRY, ADMIN_DATA_POST_ARG_ENTRY_PARENT } from '../pages/api/admin';

export class Api {
    private static get(url: string) {
        return fetch(`/api${url}`);
    }
    private static post(url: string, body: any) {
        return fetch(`/api${url}`, { method: 'POST', body: typeof body === 'object' ? JSON.stringify(body) : body });
    }
    private static put(url: string, body: any) {
        return fetch(`/api${url}`, { method: 'PUT', body: typeof body === 'object' ? JSON.stringify(body) : body });
    }

    static getData() {
        return this.get('/admin');
    }

    static saveEntry(entry: ADMIN_DATA_POST_ARG_ENTRY, parent: ADMIN_DATA_POST_ARG_ENTRY_PARENT) {
        return this.post(`/admin`, { entry, parent });
    }

    static logIn(username: string, password: string) {
        return this.post('/admin/login', { username, password });
    }
}

export type {
    ADMIN_DATA_ERROR_RETURN,
    ADMIN_DATA_GET_RETURN,
    ADMIN_DATA_POST_ARG_ENTRY,
    ADMIN_DATA_POST_ARG_ENTRY_PARENT,
    ADMIN_DATA_POST_RETURN
} from '../pages/api/admin';
