import keyBy from 'lodash/keyBy';
import type { Binary, Db } from 'mongodb';
import UUID from 'uuid-mongodb';
import { uuidToString } from '../utils';
import type { BaseEntry as Entry, MappedEntry, MappedEntryTree } from './_types';

export async function getMainEntry(db: Db, uuid: string) {
    const result = await db
        .collection('main')
        .aggregate<{ entry: Entry; subEntries: Entry[]; lastUpdated: string } | undefined>([
            { $match: { type: 'main' } },
            { $unwind: { path: '$data' } },
            {
                $project: {
                    _id: 0,
                    data: 1
                }
            },
            { $match: { data: UUID.from(uuid) } },
            {
                $lookup: {
                    from: 'entries',
                    localField: 'data',
                    foreignField: '_id',
                    as: 'entry'
                }
            },
            { $unwind: { path: '$entry' } },
            { $replaceRoot: { newRoot: { entry: '$entry' } } },
            {
                $graphLookup: {
                    from: 'entries',
                    startWith: '$entry.subEntries',
                    connectFromField: 'subEntries',
                    connectToField: '_id',
                    as: 'subEntries'
                }
            },
            {
                $set: {
                    lastUpdated: {
                        $toString: {
                            $max: [
                                '$entry._modified',
                                {
                                    $max: '$subEntries._modified'
                                }
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    entry: {
                        _created: 0,
                        _modified: 0
                    },
                    subEntries: {
                        _created: 0,
                        _modified: 0
                    }
                }
            }
        ])
        .toArray();

    if (!result[0]) {
        return null;
    }

    const [{ lastUpdated, ...entries }] = result;

    const [entry, ...subEntriesArray] = [entries.entry, ...entries.subEntries].map<MappedEntry>(
        ({ _id, ...thisEntry }) => ({
            ...thisEntry,
            id: uuidToString(_id),
            subEntries: thisEntry.subEntries.map(uuidToString)
        })
    );
    const subEntries = keyBy(subEntriesArray, 'id');

    function mapSubEntries(thisEntry: MappedEntry): MappedEntryTree {
        return {
            ...thisEntry,
            subEntries: thisEntry.subEntries.map(uuid => mapSubEntries(subEntries[uuid]))
        };
    }

    return {
        entry: mapSubEntries(entry),
        lastUpdated
    };
}
