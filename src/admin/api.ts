import { ADMIN_DATA_POST_TYPE_ENTRY } from '../pages/api/admin';

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

    static saveEntry(entry: ADMIN_DATA_POST_TYPE_ENTRY) {
        return this.post(`/admin`, { entry });
    }

    static logIn(username: string, password: string) {
        return this.post('/admin/login', { username, password });
    }
}

export type { ADMIN_DATA_POST_TYPE_ENTRY };
