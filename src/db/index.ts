import type { Binary } from 'mongodb';
import type { Connection, Document, Model } from 'mongoose';
import mongoose, { Schema } from 'mongoose';
import UUID from 'uuid-mongodb';
import _pick from 'lodash/fp/pick';

const EntrySchema = new Schema<IEntry, Model<IEntry, {}, {}>>(
    {
        _id: Schema.Types.Buffer,
        subEntries: [Schema.Types.Buffer],
        title: String,
        markdownContent: String,
        links: [{ url: String, label: String }]
    },
    {
        collection: 'entries'
    }
);

type EntryDocument = Document<Binary, any, IEntry>;
type EitherOr<B extends boolean, True, False> = (B extends true ? True : never) | (B extends false ? False : never);
export class DB {
    private static connection: Connection | undefined;

    static async connect() {
        return (this.connection ??= await mongoose
            .createConnection(process.env.DB_CONNECTION_STRING ?? '')
            .asPromise());
    }

    static async close() {
        this.connection?.close();
    }

    static async getMainEntriesIds() {
        await this.connect();

        const mainDoc = await this.connection?.db
            .collection<{ type: 'main'; data: Binary[] }>('main')
            .findOne({ type: 'main' });

        return mainDoc?.data.map(binaryId => UUID.from(binaryId)) ?? [];
    }

    static async getChangelog() {
        await this.connect();

        const mainDoc = await this.connection?.db
            .collection<{ type: 'changelog'; data: ChangeLog }>('main')
            .findOne({ type: 'changelog' });

        return mainDoc?.data ?? [];
    }

    private static mapToBaseEntry(entryDocument: EntryDocument): BaseDataEntry {
        const entry = entryDocument.toObject<IEntry>();
        return {
            id: UUID.from(entry._id),
            title: entry.title,
            markdownContent: entry.markdownContent
        };
    }

    private static getFulfilledResults<T>(settledResults: PromiseSettledResult<T | null>[]): T[] {
        return settledResults
            .filter(
                (settledResult): settledResult is PromiseFulfilledResult<T> =>
                    settledResult.status === 'fulfilled' && settledResult.value !== null
            )
            .map(result => result.value);
    }

    static async getMainEntries() {
        const connection = await this.connect();
        const EntryModel = connection.model('Entry', EntrySchema);

        const mainEntriesIds = await this.getMainEntriesIds();
        const mainEntriesPromises = mainEntriesIds.map(id => EntryModel.findById(id).exec());
        const allResults = await Promise.allSettled(mainEntriesPromises);

        return this.getFulfilledResults(allResults).map(this.mapToBaseEntry);
    }

    private static async mapAndExpandEntry<B extends boolean, R extends EitherOr<B, ExpandedDataEntry, DataEntry>>(
        Entry: mongoose.Model<IEntry, {}, {}>,
        id: string | Binary,
        expandSubentries: B
    ): Promise<null | R> {
        const doc = (await Entry.findById(UUID.from(id)).exec())?.toObject<IEntry>();

        if (!doc) {
            return null;
        }

        const entry: DataEntry = {
            id: UUID.from(id),
            subEntries: doc.subEntries.map(binaryId => UUID.from(binaryId)),
            title: doc.title,
            markdownContent: doc.markdownContent,
            links: doc.links
        };

        if (expandSubentries) {
            const subEntriesPromises = doc.subEntries.map(id => this.mapAndExpandEntry(Entry, id, true));
            const allResults = await Promise.allSettled(subEntriesPromises);

            return {
                ...entry,
                subEntries: this.getFulfilledResults(allResults)
            } as R;
        }

        return entry as R;
    }

    static async getEntry<B extends boolean, R extends EitherOr<B, ExpandedDataEntry, DataEntry>>(
        id: string,
        expandSubentries: B
    ): Promise<null | R> {
        const connection = await this.connect();

        return this.mapAndExpandEntry(
            connection.model('Entry', EntrySchema),
            id,
            expandSubentries
        ) as Promise<null | R>;
    }
}

export type Link = { url: string; label: string };
export type Links = Link[];

interface IEntry {
    _id: Binary;
    subEntries: Binary[];
    title: string;
    markdownContent: string;
    links: Links;
}

export interface BaseDataEntry {
    id: UUID.MUUID;
    title: string;
    markdownContent: string;
}

export interface BaseDataEntryWithLinks extends BaseDataEntry {
    links: Links;
}

export interface ExpandedDataEntry extends BaseDataEntryWithLinks {
    subEntries: ExpandedDataEntry[];
}

export interface DataEntry extends BaseDataEntryWithLinks {
    subEntries: UUID.MUUID[];
}

export type ChangeLog = Array<{ date: Date; description: string }>;

export type MapDataEntry<E extends BaseDataEntry> = {
    [K in keyof E]: E[K] extends UUID.MUUID
        ? string
        : E[K] extends UUID.MUUID[]
        ? string[]
        : E[K] extends BaseDataEntry
        ? MapDataEntry<E[K]>
        : E[K] extends BaseDataEntry[]
        ? MapDataEntry<E[K][number]>[]
        : E[K];
};

function isDataEntryArray(array: ExpandedDataEntry[] | UUID.MUUID[]): array is ExpandedDataEntry[] {
    return array.length === 0 || 'title' in array[0];
}

export function mapDatumToStringIds<E extends BaseDataEntry>(entry: E): MapDataEntry<E> {
    const typedEntry = entry as BaseDataEntry | ExpandedDataEntry | DataEntry;
    const result = {
        ...typedEntry,
        id: typedEntry.id.toString('D'),
        ...('links' in typedEntry && {
            links: typedEntry.links.map(_pick<Link, keyof Link>(['url', 'label']))
        }),
        ...('subEntries' in typedEntry && {
            subEntries: isDataEntryArray(typedEntry.subEntries)
                ? typedEntry.subEntries.map(mapDatumToStringIds)
                : typedEntry.subEntries.map(muuid => muuid.toString('D'))
        })
    };
    return result as MapDataEntry<E>;
}
