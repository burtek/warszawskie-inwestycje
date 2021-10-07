import keyBy from 'lodash/keyBy';
import type { Db } from 'mongodb';
import UUID from 'uuid-mongodb';
import { uuidToString } from '../utils';
import { getMain } from './_collections';
import type { BaseEntry as Entry, MappedEntry, MappedEntryTree } from './_types';

export async function getMainEntry(db: Db, uuid: string) {
    const [rawEntry] = await getRawData(db, uuid);

    if (!rawEntry) {
        return null;
    }

    const { lastUpdated, ...entries } = rawEntry;

    const [entry, ...subEntriesArray] = [entries.entry, ...entries.subEntries].map<MappedEntry>(
        ({ _id, subEntries, ...thisEntry }) => ({
            id: uuidToString(_id),
            ...thisEntry,
            subEntries: subEntries.map(uuidToString)
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

function getRawData(db: Db, uuid: string) {
    return getMain(db)
        .aggregate<{ entry: Entry; subEntries: Entry[]; lastUpdated: string } | undefined>([
            {
                $match: {
                    type: 'main'
                }
            },
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
}
