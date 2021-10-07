import { MongoClient } from 'mongodb';
import { getDbUrl } from '../lib/dbUrl';
import { getMainEntry, getHomeData, getMainEntryIds, getNavbar } from './getters';
import type * as Types from './getters/_types';

export type { Types };

export class DB {
    private static dbUri = getDbUrl(
        process.env.DB_USER as string,
        process.env.DB_PASS as string,
        process.env.DB_DB as string
    );
    private static client = new MongoClient(DB.dbUri, { maxIdleTimeMS: 1000 });

    static async getDb() {
        await this.client.connect();
        return this.client.db(process.env.DB_DB);
    }

    static async getMainEntry(uuid: string) {
        return getMainEntry(await this.getDb(), uuid);
    }

    static async getHomeData() {
        return getHomeData(await this.getDb());
    }

    static async getNavbar() {
        return getNavbar(await this.getDb());
    }

    static async getMainEntryIds() {
        return getMainEntryIds(await this.getDb());
    }
}
