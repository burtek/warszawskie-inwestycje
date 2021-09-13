import type { Binary } from 'mongodb';
import type { Connection, Model } from 'mongoose';
import mongoose, { Schema } from 'mongoose';
import UUID, { MUUID } from 'uuid-mongodb';
import _pick from 'lodash/fp/pick';
import _maxBy from 'lodash/maxBy';
import dayjs from 'dayjs';
import { uuidToString } from './mapMUUID';

interface IEntry {
    _id: Binary;
    _created: Date;
    _modified: Date;
    subEntries: Binary[];
    title: string;
    markdownContent: string;
    links: Links;
}
const EntrySchema = new Schema<IEntry, Model<IEntry, {}, {}>>(
    {
        _id: Schema.Types.Buffer,
        _created: Schema.Types.Date,
        _modified: Schema.Types.Date,
        subEntries: [Schema.Types.Buffer],
        title: String,
        markdownContent: String,
        links: [{ url: String, label: String }]
    },
    {
        collection: 'entries'
    }
);

type EitherOr<B extends boolean, True, False> = (B extends true ? True : never) | (B extends false ? False : never);
export class DB {
    private static connection: Connection | undefined;

    static async connect() {
        const dbUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_DB}?retryWrites=true&w=majority`;

        switch (this.connection?.readyState) {
            case undefined:
            case 0:
            case 3:
                await this.connection?.close();
                this.connection = await mongoose.createConnection(dbUri, { maxIdleTimeMS: 1000 }).asPromise();
                break;
            case 2:
                await this.connection.asPromise();
        }

        return this.connection as Connection;
    }

    static close() {
        this.connection?.close();
    }

    private static getConfig =
        <D extends unknown>() =>
        async <T extends string, R extends unknown>(type: T, mapper: (arg: D) => R) => {
            const connection = await this.connect();

            const mainDoc = await connection.db.collection<{ type: T; data: D[] }>('main').findOne({ type });

            return mainDoc?.data.map(mapper) ?? [];
        };

    static getMainEntriesIds() {
        return this.getConfig<Binary>()('main', uuidToString);
    }

    static getChangelog() {
        return this.getConfig<{ date: Date; description: string }>()('changelog', ({ date, description }) => ({
            date: dayjs(date).toISOString(),
            description
        }));
    }

    private static async getFulfilledResults<T>(promises: Promise<T | null>[]): Promise<T[]> {
        const settledResults = await Promise.allSettled(promises);

        return settledResults
            .filter(
                (settledResult): settledResult is PromiseFulfilledResult<T> =>
                    settledResult.status === 'fulfilled' && settledResult.value !== null
            )
            .map(result => result.value);
    }

    private static mapToBaseEntry({ id, title, markdownContent, lastUpdate }: DataEntry): BaseDataEntry {
        return { id, title, markdownContent, lastUpdate };
    }

    static async getMainEntries() {
        const mainEntriesIds = await this.getMainEntriesIds();
        const mainEntriesPromises = mainEntriesIds.map(id => this.getEntry(id, false));
        const allResults = await this.getFulfilledResults(mainEntriesPromises);

        return allResults.map(this.mapToBaseEntry);
    }

    private static async mapAndExpandEntry<B extends boolean, R extends EitherOr<B, ExpandedDataEntry, DataEntry>>(
        Entry: mongoose.Model<IEntry, {}, {}>,
        id: string | MUUID,
        expandSubentries: B
    ): Promise<null | R> {
        const entryDoc = (await Entry.findById(UUID.from(id)).exec())?.toObject<IEntry>();

        if (!entryDoc) {
            return null;
        }

        const mappedEntry = {
            id: uuidToString(id),
            subEntries: entryDoc.subEntries.map(binaryId => UUID.from(binaryId)),
            title: entryDoc.title,
            markdownContent: entryDoc.markdownContent,
            links: entryDoc.links.map(_pick<Link, keyof Link>(['url', 'label'])),
            lastUpdate: entryDoc._modified.toISOString()
        };

        const subEntriesPromises = mappedEntry.subEntries.map(id => this.mapAndExpandEntry(Entry, id, true));
        const subEntries = await this.getFulfilledResults(subEntriesPromises);
        mappedEntry.lastUpdate = _maxBy([mappedEntry, ...subEntries], entry =>
            dayjs(entry.lastUpdate).unix()
        )!.lastUpdate;

        if (expandSubentries) {
            return {
                ...mappedEntry,
                subEntries
            } as R;
        }

        return {
            ...mappedEntry,
            subEntries: mappedEntry.subEntries.map(uuidToString)
        } as R;
    }

    static async getEntry<B extends boolean, R extends EitherOr<B, ExpandedDataEntry, DataEntry>>(
        id: string | MUUID,
        expandSubentries: B
    ): Promise<null | R> {
        const connection = await this.connect();

        return this.mapAndExpandEntry(connection.model('Entry', EntrySchema), id, expandSubentries);
    }
}

export type Link = { url: string; label: string };
export type Links = Link[];

export type ChangeLogItem = { date: string; description: string };
export type ChangeLog = ChangeLogItem[];

export interface BaseDataEntry {
    id: string;
    title: string;
    markdownContent: string;
    lastUpdate: string;
}
export interface BaseDataEntryWithLinks extends BaseDataEntry {
    links: Links;
}
export interface ExpandedDataEntry extends BaseDataEntryWithLinks {
    subEntries: ExpandedDataEntry[];
}
export interface DataEntry extends BaseDataEntryWithLinks {
    subEntries: string[];
}
