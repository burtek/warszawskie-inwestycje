import type { Binary, Db } from 'mongodb';
import { uuidToString } from '../utils';

export interface ChangelogItem {
    date: string;
    description: string;
}
interface Entry {
    _id: Binary;
    title: string;
    markdownContent: string;
    lastUpdate: string;
}
export interface HomeEntry {
    id: string;
    title: string;
    markdownContent: string;
    lastUpdate: string;
}

export async function getHomeData(db: Db) {
    const [{ changelog, mainEntries }] = await db
        .collection('main')
        .aggregate<{ changelog: ChangelogItem[]; mainEntries: Entry[] }>([
            {
                $facet: {
                    changelog: [
                        { $match: { type: 'changelog' } },
                        { $unwind: { path: '$data' } },
                        {
                            $project: {
                                _id: 0,
                                description: '$data.description',
                                date: { $toString: '$data.date' }
                            }
                        }
                    ],
                    mainEntries: [
                        { $match: { type: 'main' } },
                        { $unwind: { path: '$data' } },
                        {
                            $lookup: {
                                from: 'entries',
                                localField: 'data',
                                foreignField: '_id',
                                as: 'data'
                            }
                        },
                        { $unwind: { path: '$data' } },
                        { $replaceRoot: { newRoot: '$data' } },
                        {
                            $graphLookup: {
                                from: 'entries',
                                startWith: '$_id',
                                connectFromField: 'subEntries',
                                connectToField: '_id',
                                as: 'subEntries'
                            }
                        },
                        { $set: { lastUpdate: { $max: '$subEntries._modified' } } },
                        {
                            $project: {
                                title: 1,
                                markdownContent: 1,
                                lastUpdate: { $toString: '$lastUpdate' }
                            }
                        }
                    ]
                }
            }
        ])
        .toArray();

    return {
        changelog,
        mainEntries: mainEntries.map(({ _id, ...entry }) => ({ id: uuidToString(_id), ...entry }))
    };
}

export async function getMainEntryIds(db: Db) {
    const entry = await db.collection<{ type: 'main'; data: Binary[] }>('main').findOne({ type: 'main' });

    return entry?.data.map(uuidToString);
}
