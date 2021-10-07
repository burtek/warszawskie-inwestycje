import type { Binary, Collection, Db } from 'mongodb';
import type { Entry, RawChangelogItem } from './_types';

export type MainMain = {
    type: 'main';
    data: Binary[];
};
export type MainChangelog = {
    type: 'changelog';
    data: RawChangelogItem[];
};
type Main = MainMain | MainChangelog;

export function getMain<T = Main>(db: Db): Collection<T>;
export function getMain<T extends Main['type']>(db: Db, type: T): Promise<Extract<Main, { type: T }>>;
export function getMain<T extends Main['type']>(db: Db, type?: T) {
    if (!type) {
        return db.collection<Main>('main');
    }
    return db.collection('main').findOne({ type });
}

export function getEntries(db: Db) {
    return db.collection<Entry>('entries');
}
